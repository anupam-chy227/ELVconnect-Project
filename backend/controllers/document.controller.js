const documentService = require("../services/document.service");
const asyncHandler = require("../utils/asyncHandler");

const formatDocument = (document) => ({
  id: document.id,
  project_id: document.project_id,
  uploaded_by: document.uploaded_by,
  document_type: document.document_type,
  title: document.title,
  file_url: document.file_url,
  file_name: document.file_name,
  mime_type: document.mime_type,
  created_at: document.created_at,
  updated_at: document.updated_at,
});

const uploadDocument = asyncHandler(async (req, res) => {
  const document = await documentService.uploadDocument(req.body, req.user);

  res.status(201).json({
    success: true,
    data: {
      document: formatDocument(document),
    },
  });
});

const getProjectDocuments = asyncHandler(async (req, res) => {
  const documents = await documentService.getProjectDocuments({
    project_id: req.params.project_id,
    document_type: req.query.document_type,
    user: req.user,
  });

  res.status(200).json({
    success: true,
    data: {
      documents: documents.map(formatDocument),
    },
  });
});

const getDocumentById = asyncHandler(async (req, res) => {
  const document = await documentService.getDocumentById(
    req.params.document_id,
    req.user
  );

  res.status(200).json({
    success: true,
    data: {
      document: formatDocument(document),
    },
  });
});

module.exports = {
  uploadDocument,
  getProjectDocuments,
  getDocumentById,
};
