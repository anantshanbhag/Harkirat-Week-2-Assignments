/**
  You need to create an express HTTP server in Node.js which will handle the logic of a todo list app.
  - Don't use any database, just store all the data in an array to store the todo list data (in-memory)
  - Hard todo: Try to save responses in files, so that even if u exit the app and run it again, the data remains (similar to databases)

  Each todo has a title and a description. The title is a string and the description is a string.
  Each todo should also get an unique autogenerated id every time it is created
  The expected API endpoints are defined below,
  1.GET /todos - Retrieve all todo items
    Description: Returns a list of all todo items.
    Response: 200 OK with an array of todo items in JSON format.
    Example: GET http://localhost:3000/todos
    
  2.GET /todos/:id - Retrieve a specific todo item by ID
    Description: Returns a specific todo item identified by its ID.
    Response: 200 OK with the todo item in JSON format if found, or 404 Not Found if not found.
    Example: GET http://localhost:3000/todos/123
    
  3. POST /todos - Create a new todo item
    Description: Creates a new todo item.
    Request Body: JSON object representing the todo item.
    Response: 201 Created with the ID of the created todo item in JSON format. eg: {id: 1}
    Example: POST http://localhost:3000/todos
    Request Body: { "title": "Buy groceries", "completed": false, description: "I should buy groceries" }
    
  4. PUT /todos/:id - Update an existing todo item by ID
    Description: Updates an existing todo item identified by its ID.
    Request Body: JSON object representing the updated todo item.
    Response: 200 OK if the todo item was found and updated, or 404 Not Found if not found.
    Example: PUT http://localhost:3000/todos/123
    Request Body: { "title": "Buy groceries", "completed": true }
    
  5. DELETE /todos/:id - Delete a todo item by ID
    Description: Deletes a todo item identified by its ID.
    Response: 200 OK if the todo item was found and deleted, or 404 Not Found if not found.
    Example: DELETE http://localhost:3000/todos/123

    - For any other route not defined in the server return 404

  Testing the server - run `npm run test-todoServer` command in terminal
 */
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const PORT = 3000;
const app = express();
app.use(bodyParser.json());

const allowCrossOrigin = (req, res, next) => {
  const { origin } = req.headers;
  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    //res.sendStatus(200);
  }
  next();
};
app.use(cors());

const FILENAME = "list.json";
const FILEPATH = path.join(__dirname, "./files/", FILENAME);

const generateNewId = (list) => {
  let maxId = 0;

  list.forEach((item) => {
    if (item.id > maxId) {
      maxId = item.id;
    }
  });

  return maxId + 1;
};

const getListFromFile = (getFromFileCb) => {
  fs.readFile(FILEPATH, "utf8", (err, data) => {
    if (err) throw err;
    const list =
      typeof data === "string"
        ? JSON.parse(data)
        : typeof data === "object"
        ? data
        : [];
    getFromFileCb(list);
  });
};

const storeListToFile = (list, writeToFileCb) => {
  fs.writeFile(FILEPATH, JSON.stringify(list), (err) => {
    if (err) throw err;
    writeToFileCb(true);
  });
};

app.get("/todos", (req, res) => {
  getListFromFile((list) => {
    res.send(list);
  });
});

app.get("/todos/:id", (req, res) => {
  const id = +req.params?.id;

  getListFromFile((list) => {
    const foundItem = list.find((x) => x.id === id);
    if (!foundItem) {
      return res.status(404).send({ error: "item not Found" });
    }
    res.send(foundItem);
  });
});

app.post("/todos", (req, res) => {
  const newItem = req.body;

  if (!newItem.title) {
    return res.status(404).send({ error: "title mandatory" });
  }

  getListFromFile((list) => {
    list.push({ ...newItem, id: generateNewId(list) });

    storeListToFile(list, (isStored) => {
      if (isStored) {
        res.status(201).send(list);
      }
    });
  });
});

app.put("/todos/:id", (req, res) => {
  const id = +req.params?.id;
  const newItem = req.body;

  getListFromFile((list) => {
    const foundIndex = list.findIndex((x) => x.id === id);

    if (foundIndex === -1) {
      return res.status(404).send({ error: "item not Found" });
    }

    const currentItem = list[foundIndex];
    const updatedItem = { ...currentItem, ...newItem, id };

    list[foundIndex] = updatedItem;

    storeListToFile(list, (isStored) => {
      if (isStored) {
        res.send(list);
      }
    });
  });
});

app.delete("/todos/:id", (req, res) => {
  const id = +req.params?.id;

  getListFromFile((list) => {
    const foundIndex = list.findIndex((x) => x.id === id);

    if (foundIndex === -1) {
      return res.status(404).send({ error: "item not Found" });
    }

    list.splice(foundIndex, 1);

    storeListToFile(list, (isStored) => {
      if (isStored) {
        res.send(list);
      }
    });
  });
});

app.all("*", (req, res) => {
  res.status(404).send("Route not found");
});

app.listen(PORT, console.log("listening on 3000"));

module.exports = app;
