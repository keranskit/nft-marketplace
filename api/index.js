const http = require('http')
    , http2 = require('http2')
    , Koa = require('koa')
    , cors = require('@koa/cors')
    , bodyParser = require('koa-bodyparser')
    , Controllers = require('./controllers/index')
    , Router = require('./routes/index')
    , { MongoClient } = require('mongodb')
    , ListingsRepository = require('./repositories/listingsRepository')
    , OffersRepository = require('./repositories/offersRepository')
    , { config } = require('dotenv')
;

config();

async function start() {

    /** Init db connection **/
    const mongoDb = new MongoClient(
        process.env.MONGO_URI,
        Object.assign({
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
    );
    await mongoDb.connect()
        .catch(e => {
            console.error(`MongoDB connection error: ${e}`);
            process.exit(1);
        });
    const db = mongoDb.db(process.env.MONGO_DB);

    /** Init App */
    const app = new Koa();

    /** Init repositories */
    const listingsRepository = new ListingsRepository(db);
    const offersRepository = new OffersRepository(db);

    /** Init Controllers */
    const controllers = new Controllers({
        listings: listingsRepository,
        offers: offersRepository,
    });

    const router = new Router(controllers);

    /** Apply Middlewares */
    app.use(cors());
    app.use(bodyParser());
    app.use(router.getRouter().routes());

    /** Start server */
    http.createServer(app.callback()).listen(8080);
    http2.createSecureServer({}, app.callback()).listen(8443);
    console.log('Server listening on port 8080(HTTP) & 8443(HTTPS)');
}

start().catch(console.error);

process.on('unhandledRejection', (reason, promise) => {
    console.log(reason, ' Unhandled Rejection at Promise ', promise);
    setTimeout(() => process.exit(1), 1);
}).on('uncaughtException', error => {
    console.log(error + ' Uncaught Exception thrown');
    setTimeout(() => process.exit(1), 1);
});
