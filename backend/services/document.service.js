const Document = require("../models/document.model");
const Project = require("../models/project.model");
const ApiError = require("../utils/ApiError");

const allowedDocumentTypes = new Set(["warranty", "fire_noc", "report", "drawing"]);

const canAccessProject = (user, project) =>
  user.role === "admin" || user.id === project.customer_id;

const validateUrl = (value, fieldName) => {
  try {
    new URL(value);
  } catch (_error) {
    throw new ApiError(400, `${fieldName} must be a valid URL`);
  }
};

const getProjectOrFail = async (project_id, user) => {
  const project = await Project.findById(project_id);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!canAccessProject(user, project)) {
    throw new ApiError(403, "You cannot access this project");
  }

  return project;
};

const uploadDocument = async (payload, user) => {
  const project_id = String(payload.project_id || "").trim();
  const document_type = String(payload.document_type || "").trim();
  const title = String(payload.title || "").trim();
  const file_url = String(payload.file_url || "").trim();
  const file_name = payload.file_name ? String(payload.file_name).trim() : null;
  const mime_type = payload.mime_type ? String(payload.mime_type).trim() : null;

  if (!project_id) {
    throw new ApiError(400, "project_id is required");
  }

  if (!allowedDocumentTypes.has(document_type)) {
    throw new ApiError(400, "document_type is invalid");
  }

  if (!title) {
    throw new ApiError(400, "title is required");
  }

  if (!file_url) {
    throw new ApiError(400, "file_url is required");
  }

  validateUrl(file_url, "file_url");
  await getProjectOrFail(project_id, user);

  return Document.create({
    project_id,
    uploaded_by: user.id,
    document_type,
    title,
    file_url,
    file_name,
    mime_type,
  });
};

const getProjectDocuments = async ({ project_id, document_type, user }) => {
  await getProjectOrFail(project_id, user);

  if (document_type && !allowedDocumentTypes.has(document_type)) {
    throw new ApiError(400, "document_type is invalid");
  }

  return Document.findByProjectId(project_id, document_type || null);
};

const getDocumentById = async (document_id, user) => {
  const document = await Document.findById(document_id);
  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  await getProjectOrFail(document.project_id, user);
  return document;
};

module.exports = {
  allowedDocumentTypes,
  uploadDocument,
  getProjectDocuments,
  getDocumentById,
};
