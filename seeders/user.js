import { faker } from "@faker-js/faker";
import { User } from "../models/user.models.js";

const createUser = async (numOfUsers) => {
  try {
    const usersPromise = [];

    for (let i = 0; i < numOfUsers; i++) {
      const tempUser = User.create({
        name: faker.person.fullName(),
        username: faker.internet.username(),
        bio: faker.lorem.sentence(10),
        password: "password",
        avatar: {
          public_id: faker.system.fileName(),
          url: faker.image.avatar(),
        },
      });
      usersPromise.push(tempUser);
    }

    await Promise.all(usersPromise);
    console.log("Users created", numOfUsers);
    process.exit(1);
  } catch (error) {
    console.log("Error while creating users", error);
    process.exit(1);
  }
};



export { createUser };

