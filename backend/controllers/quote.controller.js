const quoteService = require("../services/quote.service");
const asyncHandler = require("../utils/asyncHandler");

const formatQuote = (quote) => ({
  id: quote.id,
  project_id: quote.project_id,
  vendor_id: quote.vendor_id,
  amount: Number(quote.amount),
  boq_details: quote.boq_details,
  status: quote.status,
  company_name: quote.company_name,
  rating: quote.rating === undefined ? undefined : Number(quote.rating),
  performance_score:
    quote.performance_score === undefined ? undefined : Number(quote.performance_score),
  is_lowest: quote.is_lowest,
  saving_vs_highest: quote.saving_vs_highest,
  comparison_score: quote.comparison_score,
  created_at: quote.created_at,
  updated_at: quote.updated_at,
});

const submitQuote = asyncHandler(async (req, res) => {
  const quote = await quoteService.submitQuote(req.body, req.user);

  res.status(201).json({
    success: true,
    data: {
      quote: formatQuote(quote),
    },
  });
});

const getProjectQuotes = asyncHandler(async (req, res) => {
  const quotes = await quoteService.getProjectQuotes(req.params.project_id, req.user);

  res.status(200).json({
    success: true,
    data: {
      quotes: quotes.map(formatQuote),
    },
  });
});

const compareProjectQuotes = asyncHandler(async (req, res) => {
  const quotes = await quoteService.compareProjectQuotes(req.params.project_id, req.user);

  res.status(200).json({
    success: true,
    data: {
      quotes: quotes.map(formatQuote),
    },
  });
});

module.exports = {
  submitQuote,
  getProjectQuotes,
  compareProjectQuotes,
};
