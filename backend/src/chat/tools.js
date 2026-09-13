import { betaTool } from '@anthropic-ai/sdk/helpers/beta/json-schema'
import { loopbackFetch } from './apiClient.js'

const CATEGORIES = ['phones', 'earphones', 'laptops', 'tablets', 'tvs', 'smartwatches']

// cartRef is a mutable { current: cartId } ref — checkout returns a new cart
// id, and later tool calls in the same turn (plus the final HTTP response)
// need to see the updated value.
export function buildTools({ token, cartRef }) {
  return [
    betaTool({
      name: 'search_items',
      description:
        'Search the marketplace catalog by keyword and/or category. Returns matching items ' +
        '(id, name, title, price, currency, category, available) plus pagination info. ' +
        'Use this whenever the user is looking for products — never invent item names, prices, or stock.',
      inputSchema: {
        type: 'object',
        properties: {
          search: {
            type: 'string',
            description: 'Free-text search matched against item name, title, and description.',
          },
          category: {
            type: 'string',
            enum: CATEGORIES,
            description: 'Restrict results to one category.',
          },
          page: {
            type: 'integer',
            minimum: 1,
            description: '1-indexed page number. Omit for page 1.',
          },
        },
        required: [],
      },
      async run(input) {
        const params = new URLSearchParams()
        if (input.search) params.set('search', input.search)
        if (input.category) params.set('category', input.category)
        if (input.page) params.set('page', String(input.page))

        const data = await loopbackFetch(`/items?${params.toString()}`, { token })
        if (data.error) return JSON.stringify(data)

        return JSON.stringify({
          items: data.items.map((item) => ({
            id: item.id,
            name: item.name,
            title: item.title,
            price: item.price,
            currency: item.currency,
            category: item.category,
            available: item.available,
          })),
          page: data.page,
          totalPages: data.totalPages,
          total: data.total,
        })
      },
    }),

    betaTool({
      name: 'get_item_details',
      description:
        'Get full details for one item by id, including its technical specs. Use this after ' +
        'search_items when the user wants more detail on a specific item.',
      inputSchema: {
        type: 'object',
        properties: {
          itemId: { type: 'integer', description: 'The item id, from search_items results.' },
        },
        required: ['itemId'],
      },
      async run(input) {
        const data = await loopbackFetch(`/items/${input.itemId}`, { token })
        return JSON.stringify(data)
      },
    }),

    betaTool({
      name: 'view_cart',
      description: "View the current contents of the user's cart: items, quantities, and total.",
      inputSchema: { type: 'object', properties: {}, required: [] },
      async run() {
        const data = await loopbackFetch(`/carts/${cartRef.current}`, { token })
        return JSON.stringify(data)
      },
    }),

    betaTool({
      name: 'add_to_cart',
      description:
        'Add an item to the cart, or increase its quantity if already in the cart. ' +
        'Quantity is silently clamped to current available stock.',
      inputSchema: {
        type: 'object',
        properties: {
          itemId: { type: 'integer', description: 'The item id to add.' },
          quantity: {
            type: 'integer',
            minimum: 1,
            description: 'How many to add. Defaults to 1.',
          },
        },
        required: ['itemId'],
      },
      async run(input) {
        const data = await loopbackFetch(`/carts/${cartRef.current}/items`, {
          token,
          method: 'POST',
          body: { itemId: input.itemId, quantity: input.quantity || 1 },
        })
        return JSON.stringify(data)
      },
    }),

    betaTool({
      name: 'update_cart_quantity',
      description:
        'Set the exact quantity of an item already in the cart. A quantity of 0 removes it.',
      inputSchema: {
        type: 'object',
        properties: {
          itemId: { type: 'integer' },
          quantity: { type: 'integer', minimum: 0 },
        },
        required: ['itemId', 'quantity'],
      },
      async run(input) {
        const data = await loopbackFetch(`/carts/${cartRef.current}/items/${input.itemId}`, {
          token,
          method: 'PATCH',
          body: { quantity: input.quantity },
        })
        return JSON.stringify(data)
      },
    }),

    betaTool({
      name: 'remove_from_cart',
      description: 'Remove an item from the cart entirely.',
      inputSchema: {
        type: 'object',
        properties: { itemId: { type: 'integer' } },
        required: ['itemId'],
      },
      async run(input) {
        const data = await loopbackFetch(`/carts/${cartRef.current}/items/${input.itemId}`, {
          token,
          method: 'DELETE',
        })
        return JSON.stringify(data)
      },
    }),

    betaTool({
      name: 'checkout',
      description:
        'Place an order for everything currently in the cart. Requires a name and an email — ' +
        'ask for whichever is missing before calling this. Confirm the cart contents and total ' +
        'with the user first.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Full name for the order.' },
          email: { type: 'string', description: 'Email address for the order.' },
        },
        required: ['name', 'email'],
      },
      async run(input) {
        const data = await loopbackFetch(`/carts/${cartRef.current}/checkout`, {
          token,
          method: 'POST',
          body: { name: input.name, email: input.email },
        })
        if (!data.error && data.cart) {
          cartRef.current = data.cart.id
        }
        return JSON.stringify(data)
      },
    }),

    betaTool({
      name: 'list_my_orders',
      description: "List the user's past orders (most recent first), each with its items and total.",
      inputSchema: { type: 'object', properties: {}, required: [] },
      async run() {
        const data = await loopbackFetch('/orders', { token })
        return JSON.stringify(data)
      },
    }),

    betaTool({
      name: 'get_order_details',
      description: 'Get full details for one past order by id.',
      inputSchema: {
        type: 'object',
        properties: {
          orderId: { type: 'string', description: 'The order id, from list_my_orders.' },
        },
        required: ['orderId'],
      },
      async run(input) {
        const data = await loopbackFetch(`/orders/${input.orderId}`, { token })
        return JSON.stringify(data)
      },
    }),
  ]
}
