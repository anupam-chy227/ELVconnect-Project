"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@/hooks/useMutation";
import { useToast } from "@/components/Toast";
import { createInvoiceSchema, type CreateInvoiceFormData, type InvoiceLineItemFormData } from "@/schemas/invoice.schema";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Trash2, Plus, AlertCircle } from "lucide-react";
import { ZodError } from "zod";

export default function CreateInvoicePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState<CreateInvoiceFormData>({
    type: "tax_invoice",
    template: "classic",
    to: {
      name: "",
      companyName: "",
      email: "",
      phone: "",
      address: "",
      trn: "",
    },
    projectName: "",
    siteAddress: "",
    poNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    currency: "INR",
    lineItems: [],
    globalDiscount: 0,
    paymentTerms: "",
    notes: "",
    retentionPercentage: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createInvoiceMutation = useMutation({
    method: "post",
    url: "/invoices",
    onSuccess: () => {
      addToast("Invoice created successfully!", "success");
      router.push("/dashboard/invoices");
    },
    successMessage: "Invoice created",
  });

  const categories = [
    "cctv",
    "access_control",
    "fire_alarm",
    "structured_cabling",
    "pa_system",
    "bms",
    "intercom",
    "gate_automation",
    "av_integration",
    "labor",
    "service",
    "amc",
    "variation",
    "other",
  ];

  const types = [
    { value: "tax_invoice", label: "Tax Invoice" },
    { value: "proforma", label: "Proforma Invoice" },
    { value: "boq", label: "BOQ (Bill of Quantities)" },
    { value: "amc", label: "AMC (Annual Maintenance Contract)" },
    { value: "progress", label: "Progress Invoice" },
    { value: "credit_note", label: "Credit Note" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("to.")) {
      const field = name.replace("to.", "");
      setFormData((prev) => ({
        ...prev,
        to: { ...prev.to, [field]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "globalDiscount" || name === "retentionPercentage" ? parseFloat(value) || 0 : value,
      }));
    }
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          category: "service",
          description: "",
          unit: "hrs",
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          vatRate: 5,
        },
      ],
    }));
  };

  const removeLineItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };

  const updateLineItem = <Field extends keyof InvoiceLineItemFormData>(
    index: number,
    field: Field,
    value: InvoiceLineItemFormData[Field],
  ) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const calculateLineTotal = (item: InvoiceLineItemFormData) => {
    const lineTotal = item.quantity * item.unitPrice;
    const afterDiscount = lineTotal - (item.discount || 0);
    const vat = afterDiscount * ((item.vatRate || 0) / 100);
    return afterDiscount + vat;
  };

  const calculateGrandTotal = () => {
    let total = 0;
    formData.lineItems.forEach((item) => {
      total += calculateLineTotal(item);
    });
    const afterGlobalDiscount = total - (total * formData.globalDiscount) / 100;
    const afterRetention = afterGlobalDiscount - (afterGlobalDiscount * (formData.retentionPercentage || 0)) / 100;
    return afterRetention;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = createInvoiceSchema.parse(formData);
      const payload = {
        ...validatedData,
        to: {
          ...validatedData.to,
          address:
            validatedData.to.address ||
            validatedData.siteAddress ||
            user?.profile.companyName ||
            "India",
        },
        invoiceDate: new Date(validatedData.invoiceDate).toISOString(),
        dueDate: new Date(validatedData.dueDate).toISOString(),
        paymentTerms: validatedData.paymentTerms || "net_30",
        lineItems: validatedData.lineItems.map((item) => ({
          ...item,
          discount: item.discount ?? 0,
          vatRate: item.vatRate ?? 5,
        })),
      };
      await createInvoiceMutation.mutate(payload);
    } catch (error) {
      if (error instanceof ZodError) {
        const formErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path.join(".");
          formErrors[field] = err.message;
        });
        setErrors(formErrors);
      }
    }
  };

  return (
    <ProtectedRoute requiredRole={["customer", "service_provider", "admin"]}>
      <DashboardLayout>
        <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Create Invoice</h2>
            <p className="text-gray-600 mt-1">Generate professional invoices for your services</p>
          </div>

          {/* Invoice Type & Template */}
          <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              >
                {types.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template *
              </label>
              <select
                name="template"
                value={formData.template}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              >
                <option value="classic">Classic</option>
                <option value="modern">Modern</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>

          {/* Bill To Information */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Bill To</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="to.name"
                placeholder="Customer Name *"
                value={formData.to.name}
                onChange={handleInputChange}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
              <input
                type="text"
                name="to.companyName"
                placeholder="Company Name"
                value={formData.to.companyName}
                onChange={handleInputChange}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
              <input
                type="email"
                name="to.email"
                placeholder="Email *"
                value={formData.to.email}
                onChange={handleInputChange}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
              <input
                type="tel"
                name="to.phone"
                placeholder="Phone"
                value={formData.to.phone}
                onChange={handleInputChange}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
              <input
                type="text"
                name="to.address"
                placeholder="Address"
                value={formData.to.address}
                onChange={handleInputChange}
                className="md:col-span-2 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Project Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="projectName"
                placeholder="Project Name"
                value={formData.projectName}
                onChange={handleInputChange}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
              <input
                type="text"
                name="poNumber"
                placeholder="PO Number"
                value={formData.poNumber}
                onChange={handleInputChange}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
              <input
                type="text"
                name="siteAddress"
                placeholder="Site Address"
                value={formData.siteAddress}
                onChange={handleInputChange}
                className="md:col-span-2 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Line Items *</h3>
              <button
                type="button"
                onClick={addLineItem}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {formData.lineItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No line items yet. Add one to get started.</p>
            ) : (
              <div className="space-y-4">
                {formData.lineItems.map((item, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                      <select
                        value={item.category}
                        onChange={(e) => updateLineItem(index, "category", e.target.value as InvoiceLineItemFormData["category"])}
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, "description", e.target.value)}
                        className="md:col-span-2 px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Unit"
                        value={item.unit}
                        onChange={(e) => updateLineItem(index, "unit", e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, "quantity", parseFloat(e.target.value) || 0)}
                        step="0.01"
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                        step="0.01"
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <input
                        type="number"
                        placeholder="Discount %"
                        value={item.discount || 0}
                        onChange={(e) => updateLineItem(index, "discount", parseFloat(e.target.value) || 0)}
                        step="0.01"
                        className="px-3 py-2 border border-gray-300 rounded"
                      />
                      <input
                        type="number"
                        placeholder="VAT %"
                        value={item.vatRate || 0}
                        onChange={(e) => updateLineItem(index, "vatRate", parseFloat(e.target.value) || 0)}
                        step="0.01"
                        className="px-3 py-2 border border-gray-300 rounded"
                      />
                      <div className="px-3 py-2 bg-gray-50 rounded font-semibold">
                        Total: {formData.currency} {calculateLineTotal(item).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dates & Totals */}
          <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Date *
              </label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Global Discount (%)
              </label>
              <input
                type="number"
                name="globalDiscount"
                value={formData.globalDiscount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retention (%)
              </label>
              <input
                type="number"
                name="retentionPercentage"
                value={formData.retentionPercentage}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                max="100"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add any additional notes or payment instructions..."
              rows={4}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
            />
          </div>

          {/* Grand Total Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">
                Grand Total:
              </span>
              <span className="text-3xl font-bold text-purple-600">
                {formData.currency} {calculateGrandTotal().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={createInvoiceMutation.loading || formData.lineItems.length === 0}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
            >
              {createInvoiceMutation.loading ? "Creating..." : "Create Invoice"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:border-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
