/** biome-ignore-all lint/correctness/useExhaustiveDependencies: explanation */
"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ImageUploadMultiple from "../starter-kit-ui/image-upload-multiple";
import { Textarea } from "../ui/textarea";

// --- Zod schema expanded to match IProduct interface fields used in the form ---
const formSchema = z
  .object({
    product_sku: z.string().min(1, "SKU is required"),
    product_name: z.string().min(1, "Name is required"),
    product_description: z.string().min(1, "Description is required"),
    product_base_price: z.number().min(0),
    product_discounted_price: z.number().min(0),
    product_discount: z.number(),
    product_brand: z.string().min(1),
    // product_category will store the category _id (string)
    product_category: z.string().min(1, "Category is required"),
    product_sub_category: z.string().optional(),
    product_images: z.array(z.string()).min(1, "At least one image required"),
    product_stock: z.number().min(0),
    product_reserved_stock: z.number().min(0),
    product_low_stock_threshold: z.number().min(0),
    product_sales_count: z.number().min(0),
    product_features: z.array(z.object({ value: z.string().min(1) })).min(1),
    product_specifications: z.record(z.string(), z.string()).optional(),
    product_tags: z.array(z.string()).optional(),
    product_status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]),
    product_is_featured: z.boolean().optional(),
    product_rating: z.number().min(0).max(5).optional(),
  })
  .required();

type FormValues = z.infer<typeof formSchema>;

type CategoryItem = {
  _id: string;
  name: string;
  slug?: string;
};

export default function AddProductForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_sku: "",
      product_name: "",
      product_description: "",
      product_base_price: 0,
      product_discounted_price: 0,
      product_discount: 0,
      product_brand: "",
      product_category: "", // will be category _id
      product_sub_category: "",
      product_images: [],
      product_stock: 0,
      product_reserved_stock: 0,
      product_low_stock_threshold: 0,
      product_sales_count: 0,
      product_features: [{ value: "" }],
      product_specifications: {},
      product_tags: [],
      product_status: "ACTIVE",
      product_is_featured: false,
      product_rating: 0,
    },
  });

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setCatLoading(true);
        setCatError(null);
        const res = await fetch("/api/categories", {
          signal: controller.signal,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err?.error || `Failed to load categories (${res.status})`,
          );
        }
        const json = await res.json();
        // adapt to your API shape: here we expect { success: true, data: [...] }
        const list: CategoryItem[] = Array.isArray(json?.data)
          ? json.data
          : json?.data || [];
        setCategories(list);
        // If no category selected yet, optionally set default to first category id
        const curr = form.getValues("product_category");
        if (!curr && list.length > 0) {
          form.setValue("product_category", list[0]._id, { shouldDirty: true });
        }
      } catch (err: any) {
        if (controller.signal.aborted) return;
        console.error("Failed to fetch categories:", err);
        setCatError(err?.message || "Failed to load categories");
      } finally {
        if (!controller.signal.aborted) setCatLoading(false);
      }
    };
    load();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control: form.control,
    name: "product_features",
  });

  // Image upload callback
  const handleUploadComplete = (uploadedUrls: string[]) => {
    form.setValue("product_images", uploadedUrls, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Watch prices and calculate discount
  const basePrice = useWatch({
    control: form.control,
    name: "product_base_price",
  });
  const discountedPrice = useWatch({
    control: form.control,
    name: "product_discounted_price",
  });

  useEffect(() => {
    if (
      typeof basePrice === "number" &&
      basePrice > 0 &&
      typeof discountedPrice === "number"
    ) {
      const discount = ((basePrice - discountedPrice) / basePrice) * 100;
      const rounded = Math.round(discount * 100) / 100;
      form.setValue("product_discount", isFinite(rounded) ? rounded : 0, {
        shouldDirty: true,
      });
    } else {
      form.setValue("product_discount", 0, { shouldDirty: true });
    }
  }, [basePrice, discountedPrice, form]);

  // Specifications - using record in state (like previous implementation)
  const specifications = form.watch("product_specifications") || {};

  const addSpecification = () => {
    const current = form.getValues("product_specifications") || {};
    const key = `spec_${Date.now()}`;
    form.setValue(
      "product_specifications",
      { ...current, [key]: "" },
      { shouldDirty: true },
    );
  };

  const removeSpecification = (key: string) => {
    const current = { ...(form.getValues("product_specifications") || {}) };
    delete current[key];
    form.setValue("product_specifications", current, { shouldDirty: true });
  };

  const updateSpecificationKey = (oldKey: string, newKey: string) => {
    if (!newKey.trim()) return;
    const current = { ...(form.getValues("product_specifications") || {}) };
    if (current[oldKey] === undefined) return;
    const value = current[oldKey];
    delete current[oldKey];
    current[newKey] = value;
    form.setValue("product_specifications", current, { shouldDirty: true });
  };

  const updateSpecificationValue = (key: string, value: string) => {
    const current = { ...(form.getValues("product_specifications") || {}) };
    current[key] = value;
    form.setValue("product_specifications", current, { shouldDirty: true });
  };

  // Tags helpers (simple comma separated entry)
  const setTagsFromString = (val: string) => {
    const arr = val
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    form.setValue("product_tags", arr, { shouldDirty: true });
  };

  async function onSubmit(values: FormValues) {
    try {
      // Normalize payload the same way API expects
      const payload = {
        product_sku: values.product_sku,
        product_name: values.product_name,
        product_description: values.product_description,
        product_base_price: Number(values.product_base_price || 0),
        product_discounted_price: Number(values.product_discounted_price || 0),
        product_discount: Number(values.product_discount || 0),
        product_brand: values.product_brand,
        product_category: values.product_category, // now this is category _id
        product_sub_category: values.product_sub_category || undefined,
        product_images: values.product_images || [],
        product_stock: Number(values.product_stock || 0),
        product_reserved_stock: Number(values.product_reserved_stock || 0),
        product_low_stock_threshold: Number(
          values.product_low_stock_threshold || 10,
        ),
        product_sales_count: Number(values.product_sales_count || 0),
        product_features: (values.product_features || []).map(
          (f) => f.value || f,
        ),
        product_specifications: values.product_specifications || {},
        product_tags: values.product_tags || [],
        product_status: values.product_status || "ACTIVE",
        product_is_featured: values.product_is_featured || false,
        product_rating: Number(values.product_rating || 0),
      };

      // Client-side sanity checks
      if (payload.product_reserved_stock > payload.product_stock) {
        toast.error("Reserved stock cannot exceed total stock.");
        return;
      }
      if (!payload.product_images || payload.product_images.length === 0) {
        toast.error("Please upload at least one image.");
        return;
      }
      if (!payload.product_category) {
        toast.error("Please select a category.");
        return;
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error || "Failed to save product");
        console.error("Product save failed:", data);
        return;
      }

      toast.success("Product saved successfully");
      form.reset();
      console.log("Saved product:", data.product);
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Unexpected error while saving product");
    }
  }

  // Small utility to auto generate SKU
  const generateSKU = () => {
    const prefix = (form.getValues("product_brand") || "PR")
      .substring(0, 3)
      .toUpperCase();
    const suffix = Date.now().toString().slice(-6);
    form.setValue("product_sku", `${prefix}-${suffix}`, { shouldDirty: true });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-5xl mx-auto p-4 md:p-8"
      >
        {/* --- Row 1: SKU + Name (responsive) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="product_sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input {...field} placeholder="e.g. ABC-123456" />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={generateSKU}
                    className="whitespace-nowrap"
                  >
                    Generate
                  </Button>
                </div>
                <FormDescription>Unique product SKU.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="product_name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>Enter the product title.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="product_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
              <FormDescription>Visible on product page.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- Price Row --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="product_base_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                    min={0}
                    step="0.01"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="product_discounted_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discounted price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                    min={0}
                    step="0.01"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="product_discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount (%)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </FormControl>
                <FormDescription>Auto calculated from prices.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- Brand / Category Row --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="product_brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="product_category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(val) => field.onChange(val)}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          catLoading
                            ? "Loading categories..."
                            : "Choose category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {catLoading && (
                        <SelectItem value="__loading" disabled>
                          Loading...
                        </SelectItem>
                      )}

                      {catError && (
                        <SelectItem value="__error" disabled>
                          {catError}
                        </SelectItem>
                      )}

                      {!catLoading && categories.length === 0 && !catError && (
                        <SelectItem value="__none" disabled>
                          No categories
                        </SelectItem>
                      )}

                      {categories.map((c) => (
                        // ensure _id is a non-empty string (should be true for your API)
                        <SelectItem key={c._id} value={String(c._id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="product_sub_category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub-category</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- Images --- */}
        <FormField
          control={form.control}
          name="product_images"
          render={() => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <ImageUploadMultiple
                  multiple
                  onComplete={handleUploadComplete}
                />
              </FormControl>
              <FormDescription>
                Upload one or more images. Drag & drop supported.
              </FormDescription>
            </FormItem>
          )}
        />

        {/* --- Stock row --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="product_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value || "0"))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="product_reserved_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reserved Stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value || "0"))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="product_low_stock_threshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Low stock threshold</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value || "0"))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- Features --- */}
        <div className="p-4 border rounded-lg bg-white/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <FormLabel className="mb-0">Features</FormLabel>
              <FormDescription>Add product highlights.</FormDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => appendFeature({ value: "" })}
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>

          <div className="space-y-2">
            {featureFields.map((f, idx) => (
              <div key={f.id} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`product_features.${idx}.value` as any}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder={`Feature ${idx + 1}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {featureFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeFeature(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- Specifications (key-value) --- */}
        <div className="p-4 border rounded-lg bg-white/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <FormLabel className="mb-0">Specifications</FormLabel>
              <FormDescription>
                Technical details (key - value).
              </FormDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addSpecification}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>

          <div className="space-y-2">
            {Object.entries(specifications).map(([key, value]) => (
              <div key={key} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input
                    value={key}
                    onChange={(e) =>
                      updateSpecificationKey(key, e.target.value)
                    }
                  />
                </div>
                <div className="col-span-6">
                  <Input
                    value={value}
                    onChange={(e) =>
                      updateSpecificationValue(key, e.target.value)
                    }
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    onClick={() => removeSpecification(key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Tags / Status / Featured / Rating --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="product_tags"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Comma separated tags"
                    defaultValue={(field.value || []).join(", ")}
                    onBlur={(e) => setTagsFromString(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="product_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                      <SelectItem value="OUT_OF_STOCK">OUT_OF_STOCK</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="product_is_featured"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormLabel className="min-w-0">Featured</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(v)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* --- Submit --- */}
        <div className="flex gap-3 flex-col md:flex-row">
          <Button type="submit" className="w-full md:w-auto">
            Save Product
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              toast("Form reset");
            }}
            className="w-full md:w-auto"
          >
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
