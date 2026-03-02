const path = require("path");
const fastify = require("fastify")({ logger: true });

fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "../dist"),
  prefix: "/",
});

fastify.get("/", async (request, reply) => {
  return reply.sendFile("index.html");
});

const start = async () => {
  try {
    await fastify.listen({ port: 3100, host: "0.0.0.0" });
    // { logger: true }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
