import "dotenv/config";
import app from "./app";

const PORT = parseInt(process.env.PORT ?? "3001", 10);

app.listen(PORT, () => {
  console.log(`\nUniWallet API running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Dashboard: http://localhost:${PORT}/api/dashboard/:userId\n`);
});
