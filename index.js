const Koa = require('koa')
const app = new Koa()
const fs = require('fs')
const route = require('koa-route')
const static = require('koa-static')
const path = require('path')

app.use(static(path.join(__dirname, 'static')))

const logger = (ctx, next) => {
  console.log(`${Date.now()} ${ctx.request.method} ${ctx.request.url}`)
  next()
}

app.use(logger)

const error_handler = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.response.status = err.statusCode || err.status || 500
    if (ctx.accepts('text')) ctx.response.body = err.status + ' ' + err.message
    else if (ctx.accepts('json'))
      ctx.response.body = {
        message: err.message
      }
    else ctx.response.body = err.status + ' ' + err.message
  }
}

app.use(error_handler)

const main = ctx => {
  ctx.response.body = '<h1>首页</h1><div><a href="/api">API</a></div>'
}

const api = async ctx => {
  if (ctx.accepts('xml')) {
    ctx.response.type = 'xml'
    ctx.body = '<data>Hello World</data>'
  } else if (ctx.accepts('json')) {
    ctx.response.type = 'json'
    ctx.body = { data: 'Hello, World' }
  } else if (ctx.accepts('html')) {
    ctx.response.type = 'html'
    ctx.body = await fs.createReadStream('template.html')
  } else {
    ctx.response.type = 'text'
    ctx.body = 'Hello World'
  }
}

const error = ctx => {
  // ctx.response.status = 500
  // ctx.response.body = "Error"
  ctx.throw(500)
}

app.use(route.get('/', main))
app.use(route.get('/api', api))
app.use(route.get('/error', error))

app.listen(3000)
console.log('Listening on port 3000...')
