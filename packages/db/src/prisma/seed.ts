import { db } from "./db";
const users = [
  { email: "alice@example.com", name: "Alice", password: "12345" },
  { email: "bob@example.com", name: "Bob", password: "12345" },
  { email: "charlie@example.com", name: "Charlie", password: "12345" },
];
for (const user of users) {
  await db.orm.public.User.upsert({
    create: user,
    update: {},
    conflictOn: { email: user.email },
  });
}
console.log(`Seeded ${users.length} users.`);
await db.close();
