import { systemRouter } from "./_core/systemRouter";
import { authRouter } from "./routers/auth";
import { settingsRouter } from "./routers/settings";
import { productsRouter } from "./routers/products";
import { customersRouter } from "./routers/customers";
import { invoicesRouter } from "./routers/invoices";
import { usersRouter } from "./routers/users";
import { router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  settings: settingsRouter,
  products: productsRouter,
  customers: customersRouter,
  invoices: invoicesRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
