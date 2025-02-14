// controllers/docController.js
const { Doc, Code, Category } = require("../models");

/**
 * GET /api/docs
 * Retrieves all main docs (where parentId is null) with their codes and UI variants.
 */
const getDocs = async (req, res, next) => {
  try {
    const docs = await Doc.findAll({
      where: { parentId: null },
      include: [
        { model: Code, as: "codes" },
        {
          model: Category,
          as: "category",
          attributes: ["categoryName", "slug"],
        },
        {
          model: Doc,
          as: "uiVariants",
          include: [{ model: Code, as: "codes" }],
        },
      ],
      order: [["id", "ASC"]],
    });
    res.json(docs);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/docs/:id
 * Retrieve a single doc by its ID including its codes and variants.
 */
const getDocById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Doc.findByPk(id, {
      include: [
        { model: Code, as: "codes" },
        {
          model: Category,
          as: "category",
          attributes: ["categoryName", "slug"],
        },
        {
          model: Doc,
          as: "uiVariants",
          include: [{ model: Code, as: "codes" }],
        },
      ],
    });
    if (!doc) return res.status(404).json({ message: "Doc not found" });
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/docs
 * Create a new main doc.
 *
 * Expected payload:
 * {
 *   "uiName": "Button",
 *   "uiSubtitle": "Primary Button",
 *   "docs": "# Button Documentation...",
 *   "uniqueSlug": "buttons/primary", // Optional: auto-generated if not provided
 *   "categoryId": 1,                // The id of the associated category
 *   "codes": [
 *     { "language": "jsx", "code": "function Button() { ... }" },
 *     { "language": "css", "code": ".button { ... }" }
 *   ],
 *   "parentId": null                // for main doc (optional)
 * }
 */
const createDoc = async (req, res, next) => {
  try {
    const { uiName, uiSubtitle, docs, codes, parentId, categoryId } = req.body;

    // Create the main doc (or variant if parentId is not null)
    const newDoc = await Doc.create({
      uiName,
      uiSubtitle,
      docs,
      parentId: parentId || null,
      categoryId,
    });

    // Create associated code snippets, if provided
    if (Array.isArray(codes)) {
      for (const codeEntry of codes) {
        await Code.create({
          language: codeEntry.language,
          code: codeEntry.code,
          docId: newDoc.id,
        });
      }
    }

    // Fetch the created doc along with its codes
    const createdDoc = await Doc.findByPk(newDoc.id, {
      include: [
        { model: Code, as: "codes" },
        {
          model: Category,
          as: "category",
          attributes: ["categoryName", "slug"],
        },
      ],
    });

    res.status(201).json(createdDoc);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/docs/:id
 * Update an existing doc.
 */
const updateDoc = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { uiName, uiSubtitle, docs, categoryId } = req.body;
    const doc = await Doc.findByPk(id);
    if (!doc) return res.status(404).json({ message: "Doc not found" });

    await doc.update({ uiName, uiSubtitle, docs, categoryId });
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/docs/:id
 * Delete a doc and its associated codes/variants (via cascading).
 */
const deleteDoc = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Doc.findByPk(id);
    if (!doc) return res.status(404).json({ message: "Doc not found" });
    await doc.destroy();
    res.json({ message: "Doc deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/docs/:id/variants
 * Create a UI variant for the doc with the given ID.
 *
 * Expected payload:
 * {
 *   "uiName": "Button Variant",
 *   "uiSubtitle": "Secondary Button",
 *   "docs": "# Button Variant Documentation...",
 *   "codes": [
 *     { "language": "jsx", "code": "function VariantButton() { ... }" },
 *     { "language": "css", "code": ".variant-button { ... }" }
 *   ]
 * }
 */
const createVariant = async (req, res, next) => {
  try {
    const parentId = req.params.id;
    const { uiName, uiSubtitle, docs, codes, categoryId } = req.body;

    // Ensure parent doc exists
    const parentDoc = await Doc.findByPk(parentId);
    if (!parentDoc)
      return res.status(404).json({ message: "Parent doc not found" });

    // Create the variant doc with parentId set
    const variant = await Doc.create({
      uiName,
      uiSubtitle,
      docs,
      parentId,
      categoryId,
    });

    // Create associated codes for the variant
    if (Array.isArray(codes)) {
      for (const codeEntry of codes) {
        await Code.create({
          language: codeEntry.language,
          code: codeEntry.code,
          docId: variant.id,
        });
      }
    }

    // Fetch the newly created variant with its codes
    const createdVariant = await Doc.findByPk(variant.id, {
      include: [
        { model: Code, as: "codes" },
        {
          model: Category,
          as: "category",
          attributes: ["categoryName", "slug"],
        },
      ],
    });

    res.status(201).json(createdVariant);
  } catch (error) {
    next(error);
  }
};
/**
 * GET /api/docs/slug/:uniqueSlug
 * Retrieve a single doc by its uniqueSlug.
 * Returns the full document (including its codes and variants).
 */
const getDocByUniqueSlug = async (req, res, next) => {
  try {
    const { uniqueSlug } = req.params;

    const doc = await Doc.findOne({
      where: { uniqueSlug },
      include: [
        { model: Code, as: "codes" },
        {
          model: Category,
          as: "category",
          attributes: ["categoryName", "slug"],
        },
        {
          model: Doc,
          as: "uiVariants",
          include: [{ model: Code, as: "codes" }],
        },
      ],
    });

    if (!doc) {
      return res.status(404).json({ message: "Doc not found" });
    }

    res.json(doc);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/docs/unique-slugs
 * Retrieve a list of docs with only the uiName and uniqueSlug fields.
 * You can adjust the query to include only main docs if needed.
 */
const getUniqueSlugsGrouped = async (req, res, next) => {
  try {
    const docs = await Doc.findAll({
      where: { parentId: null },
      attributes: ["id", "uiName", "uniqueSlug", "categoryId"],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "categoryName", "slug"],
        },
      ],
      // Order by the associated category's name (you can adjust ordering as needed)
      order: [[{ model: Category, as: "category" }, "categoryName", "ASC"]],
    });

    // Group docs by category (using the category id)
    const grouped = docs.reduce((acc, doc) => {
      // Convert Sequelize instance to plain object
      const docObj = doc.toJSON();

      // If a doc has no associated category, use a default "Uncategorized" group.
      const cat = docObj.category || {
        id: "0",
        categoryName: "Uncategorized",
        slug: "uncategorized",
      };

      // Initialize the group if not already created
      if (!acc[cat.id]) {
        acc[cat.id] = {
          category: cat,
          children: [],
        };
      }

      // Push the document into the children array for this category.
      acc[cat.id].children.push({
        id: docObj.id,
        uiName: docObj.uiName,
        uniqueSlug: docObj.uniqueSlug,
        categoryId: docObj.categoryId,
      });
      return acc;
    }, {});

    // Convert the grouped object into an array
    const result = Object.values(grouped);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getUniqueSlugsWithCode = async (req, res, next) => {
  try {
    // Get categoryId from the query string (e.g., /api/docs/unique-slugs-with-code?categoryId=30)
    const { categoryId } = req.query;

    // Set the base condition to only return main docs (parentId is null)
    const condition = { parentId: null };

    // If a categoryId is provided, add it to the condition
    if (categoryId) {
      condition.categoryId = categoryId;
    }

    const docs = await Doc.findAll({
      where: condition,
      attributes: ["id", "uiName", "uniqueSlug", "categoryId"],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "categoryName", "slug"],
        },
        {
          model: Code,
          as: "codes",
          attributes: ["id", "language", "code"],
          where: { language: "tailwind" },
          required: false, // returns docs even if no tailwind code exists
        },
      ],
      order: [["categoryId", "ASC"]],
    });

    res.json(docs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocs,
  getDocById,
  createDoc,
  updateDoc,
  deleteDoc,
  createVariant,
  getDocByUniqueSlug,
  getUniqueSlugsGrouped,
  getUniqueSlugsWithCode,
};
