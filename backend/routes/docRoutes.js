// routes/docRoutes.js
const express = require("express");
const router = express.Router();
const {
  getDocs,
  getDocById,
  createDoc,
  updateDoc,
  deleteDoc,
  createVariant,
  getDocByUniqueSlug,
  getUniqueSlugs,
} = require("../controllers/docController");

// Main docs routes
router.get("/", getDocs);
router.get("/:id", getDocById);
router.post("/createDoc", createDoc);
router.put("/updateDoc/:id", updateDoc);
router.delete("/deleteDoc/:id", deleteDoc);
// Retrieve a doc by uniqueSlug
router.get("/getDocByUniqueSlug/:uniqueSlug", getDocByUniqueSlug);

// Retrieve all docs with uiName and uniqueSlug fields
router.get("/unique-slugs", getUniqueSlugs);
// Route for creating a variant for an existing doc
router.post("/createVariant/:id", createVariant);

module.exports = router;
