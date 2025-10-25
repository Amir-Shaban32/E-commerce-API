import cookieParser from 'cookie-parser';
import express , {Application} from 'express';
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from './middlewares/errorHandler';
import ordersRouter from './routes/api/orders.routes'
import cartRouter from './routes/api/cart.routes';
import categoriesRouter from './routes/api/categories.routes';
import productsRouter from './routes/api/products.routes';
import usersRouter from './routes/api/users.routes';
import paymentsRouter from './routes/api/payments.routes';
import { stripeWebhook } from './controllers/webhook.controller';
import registerRouter from './routes/register.routes';
import loginRouter from './routes/auth.routes';
import refreshRouter from './routes/refreshToken.routes';
import logoutRouter from './routes/logout.routes';
import googleRouter from './routes/googleAuth.routes';
import passport from "passport";
import session from 'express-session';
import "./config/passport";
import { adminjs , adminRouter } from './admin/admin';

const app:Application = express();

// ------------------ Documentation ------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerPath = path.join(__dirname, "swagger.yaml");
const swaggerDocument = YAML.load(swaggerPath);

// need raw body (before express.json) for signature verification
app.post('/api/webhook' ,
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// ------------------ middlewares ------------------

// middleware to handle url encoded from data
app.use(express.urlencoded({extended:true}));
// middleware to handle json data
app.use(express.json());
// middleware for cookies
app.use(cookieParser());
// documentation middleware
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// ------------------middleware for passport------------------

app.use(session({
  secret:process.env.SESSION_SECRET!,
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

// ------------------ routes ------------------

app.use(adminjs.options.rootPath , adminRouter);
app.use('/api/users',usersRouter);
app.use('/api/orders' , ordersRouter);
app.use('/api/cart' , cartRouter);
app.use('/api/categories',categoriesRouter);
app.use('/api/products' , productsRouter);
app.use('/api/payments' , paymentsRouter);
app.use('/login' , loginRouter);
app.use('/register' , registerRouter);
app.use('/refresh' , refreshRouter);
app.use('/logout' , logoutRouter);
app.use('/auth/google' , googleRouter);

//------------------ error handler ------------------

app.use(errorHandler);

export default app;