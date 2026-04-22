import { Todo } from "../models/todo.model.js";

/**
 * TODO: Create a new todo
 * - Extract data from req.body
 * - Create todo in database
 * - Return 201 with created todo
 */
export async function createTodo(req, res, next) {
  try {
    // Your code
    const { title, completed, priority, tags, dueDate } = req.body;

    const todo = await Todo.create({
      title,
      completed,
      priority,
      tags,
      dueDate,
    });

    return res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: List todos with pagination and filters
 * - Support query params: page, limit, completed, priority, search
 * - Default: page=1, limit=10
 * - Return: { data: [...], meta: { total, page, limit, pages } }
 */
export async function listTodos(req, res, next) {
  try {
    // Your code here
    // 1. Extract query params with default values
    // WHY: req.query values are optional, so we provide defaults (page=1, limit=10)
    let { page = 1, limit = 10, completed, priority, search } = req.query;

    // 2. Convert page & limit to numbers
    // WHY: query params come as strings, but math operations require numbers
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.max(1, parseInt(limit) || 10);

    // 3. Calculate skip value for pagination
    // WHY: MongoDB uses skip + limit to implement pagination
    const skip = (page - 1) * limit;

    // 4. Build filter object dynamically
    // WHY: Only include filters if user provides them (flexible API)
    const filter = {};

    if (completed !== undefined) {
      // WHY: Convert string "true"/"false" → boolean
      filter.completed = completed === "true";
    }

    if (priority) {
      // WHY: Direct match filter for priority field
      filter.priority = priority;
    }

    if (search) {
      // WHY: Regex enables partial + case-insensitive search
      filter.title = { $regex: search, $options: "i" };
    }

    // 5. Fetch data and total count in parallel
    // WHY: Promise.all improves performance (runs queries simultaneously)
    const [data, total] = await Promise.all([
      Todo.find(filter)
        .skip(skip) // WHY: skip previous pages' data
        .limit(limit) // WHY: limit results per page
        .sort({ createdAt: -1 }) // WHY: latest todos first
        .lean(), // WHY: returns plain JS objects (faster than mongoose docs)

      Todo.countDocuments(filter), // WHY: needed to calculate total pages
    ]);

    // 6. Calculate total pages
    // WHY: helps frontend know how many pages exist
    const pages = Math.ceil(total / limit);

    // 7. Send structured response
    // WHY: consistent API format (data + meta info)
    return res.status(200).json({
      data,
      meta: {
        total,
        page,
        limit,
        pages,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Get single todo by ID
 * - Return 404 if not found
 */
export async function getTodo(req, res, next) {
  try {
    // Your code here
    const todoId = req.params.id;

    const todo = await Todo.findById(todoId);
    if (!todo)
      return res.status(404).json({
        error: {
          message: "Todo not found",
        },
      });

    return res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Update todo by ID
 * - Use findByIdAndUpdate with { new: true, runValidators: true }
 * - Return 404 if not found
 */
export async function updateTodo(req, res, next) {
  try {
    // Your code here
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!todo)
      return res.status(404).json({
        error: {
          message: "Todo not found",
        },
      });

    return res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Toggle completed status
 * - Find todo, flip completed, save
 * - Return 404 if not found
 */
export async function toggleTodo(req, res, next) {
  try {
    // Your code here
    const todo = await Todo.findById(req.params.id);
    if (!todo)
      return res.status(404).json({
        error: {
          message: "Todo not found",
        },
      });

    todo.completed = !todo.completed;

    await todo.save();

    return res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
}

/**
 * TODO: Delete todo by ID
 * - Return 204 (no content) on success
 * - Return 404 if not found
 */
export async function deleteTodo(req, res, next) {
  try {
    // Your code here
    const todo = await Todo.findById(req.params.id);
    if (!todo)
      return res.status(404).json({
        error: {
          message: "Todo not found",
        },
      });
    await Todo.deleteOne(todo);

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}
