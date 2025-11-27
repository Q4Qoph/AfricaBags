"use client";

import { useState, useEffect } from "react";
import { useProducts } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  X,
  Loader2,
  Package,
  Image as ImageIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const BAG_TYPES = [
  "Tote",
  "Crossbody",
  "Shoulder Bag",
  "Clutch",
  "Backpack",
  "Wallet",
  "Other",
];
const COLORS = [
  "Black",
  "Brown",
  "Tan",
  "Cognac",
  "Red",
  "Navy",
  "Green",
  "Beige",
  "Custom",
];

export default function ProductsPage() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    materials: "",
    dimensions: "",
    weight: "",
    craftsmanshipTechnique: "",
    origin: "",
    price: "",
    bagType: "",
    color: "",
    stockQuantity: "0",
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    domesticDeliveryDays: "",
    internationalDeliveryDays: "",
    images: [] as File[],
    imagePreviews: [] as string[],
  });

  const { data: productsData, isLoading, error, refetch } = useProducts.all();
  const { mutate: createProduct, isPending: creating } = useProducts.create();
  const { mutate: updateProduct, isPending: updating } = useProducts.update();
  const { mutate: deleteProduct, isPending: deleting } = useProducts.delete();

  const products = productsData?.products || [];
  const filteredProducts = products.filter(
    (p: any) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bagType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.color?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    form.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setForm({
      name: "",
      description: "",
      materials: "",
      dimensions: "",
      weight: "",
      craftsmanshipTechnique: "",
      origin: "",
      price: "",
      bagType: "",
      color: "",
      stockQuantity: "0",
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      domesticDeliveryDays: "",
      internationalDeliveryDays: "",
      images: [],
      imagePreviews: [],
    });
    setSelectedProduct(null);
  };

  const openEditDialog = (product: any) => {
    setSelectedProduct(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      materials: product.materials || "",
      dimensions: product.dimensions || "",
      weight: product.weight || "",
      craftsmanshipTechnique: product.craftsmanshipTechnique || "",
      origin: product.origin || "",
      price: product.price?.toString() || "",
      bagType: product.bagType || "",
      color: product.color || "",
      stockQuantity: product.stockQuantity?.toString() || "0",
      isFeatured: !!product.isFeatured,
      isNewArrival: !!product.isNewArrival,
      isBestSeller: !!product.isBestSeller,
      domesticDeliveryDays: product.domesticDeliveryDays?.toString() || "",
      internationalDeliveryDays:
        product.internationalDeliveryDays?.toString() || "",
      images: [],
      imagePreviews: product.images || [],
    });
    setOpenEdit(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const preview = URL.createObjectURL(file);
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, file],
          imagePreviews: [...prev.imagePreviews, preview],
        }));
      }
    });
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(form.imagePreviews[index]);
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  const isFormValid = () =>
    form.name.trim() &&
    form.description.trim() &&
    form.materials.trim() &&
    form.dimensions.trim() &&
    form.weight.trim() &&
    form.craftsmanshipTechnique.trim() &&
    form.price &&
    parseFloat(form.price) > 0 &&
    form.bagType &&
    form.color;

  const handleSubmit = () => {
    if (!isFormValid()) {
      showToast("Please fill all required fields", "error");
      return;
    }

    const formData = new FormData();

    // Text fields
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("materials", form.materials);
    formData.append("dimensions", form.dimensions);
    formData.append("weight", form.weight);
    formData.append("craftsmanshipTechnique", form.craftsmanshipTechnique);
    if (form.origin) formData.append("origin", form.origin);
    formData.append("price", form.price);
    formData.append("bagType", form.bagType);
    formData.append("color", form.color);
    formData.append("stockQuantity", form.stockQuantity || "0");
    formData.append("isFeatured", form.isFeatured.toString());
    formData.append("isNewArrival", form.isNewArrival.toString());
    formData.append("isBestSeller", form.isBestSeller.toString());
    if (form.domesticDeliveryDays)
      formData.append("domesticDeliveryDays", form.domesticDeliveryDays);
    if (form.internationalDeliveryDays)
      formData.append(
        "internationalDeliveryDays",
        form.internationalDeliveryDays
      );

    // Critical: Send multiple images as images[]
    form.images.forEach((file) => {
      formData.append("images", file); // This is the fix
    });

    // Debug (optional – remove later)
    // for (const [k, v] of formData.entries()) console.log(k, v);

    if (openCreate) {
      createProduct(formData, {
        onSuccess: () => {
          showToast("Bag created!", "success");
          setOpenCreate(false);
          resetForm();
        },
        onError: () => showToast("Failed to create", "error"),
      });
    } else {
      updateProduct(
        { id: selectedProduct.id, data: formData },
        {
          onSuccess: () => {
            showToast("Bag updated!", "success");
            setOpenEdit(false);
            resetForm();
          },
          onError: () => showToast("Failed to update", "error"),
        }
      );
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);

  if (isLoading)
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-600">
        Error loading products{" "}
      </div>
    );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Handcrafted Leather Bags</h1>
          <p className="text-gray-600">Manage your artisan collection</p>
        </div>
        <Button
        className="bg-[#C1502E] hover:bg-[#A0442A]"
          onClick={() => {
            resetForm();
            setOpenCreate(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Bag
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name, type or color..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No bags found</p>
          </div>
        ) : (
          filteredProducts.map((product: any) => (
            <Card
              key={product.id}
              className="overflow-hidden hover:shadow-lg transition-shadow py-0"
            >
              <div className="aspect-square bg-gray-100 relative">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0].imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-16 w-16 text-gray-300" />
                  </div>
                )}
                {product.isNewArrival && (
                  <Badge className="absolute top-2 left-2">New</Badge>
                )}
                {product.isBestSeller && (
                  <Badge className="absolute top-2 right-2 bg-orange-500">
                    Best Seller
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-600">
                  {product.bagType} • {product.color}
                </p>
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(product.price)}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <span
                    className={`text-sm font-medium ${
                      product.stockQuantity > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {product.stockQuantity > 0
                      ? `${product.stockQuantity} in stock`
                      : "Out of stock"}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => {
                        setSelectedProduct(product);
                        setOpenDelete(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog
        open={openCreate || openEdit}
        onOpenChange={(o) =>
          !o && (setOpenCreate(false), setOpenEdit(false), resetForm())
        }
      >
        <DialogContent
          className="w-full max-w-xl md:max-w-3xl
             max-h-[80vh] p-6 overflow-hidden rounded-xl"
        >
          <DialogHeader>
            <DialogTitle>{openCreate ? "Add New Bag" : "Edit Bag"}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh] px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              <div className="space-y-4 col-span-2">
                <div>
                  <Label>
                    Bag Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="The Heritage Tote"
                  />
                </div>
                <div>
                  <Label>
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={form.description}
                    onChange={(e: any) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>
                      Bag Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={form.bagType}
                      onValueChange={(v) => setForm({ ...form, bagType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BAG_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>
                      Color <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={form.color}
                      onValueChange={(v) => setForm({ ...form, color: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLORS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>
                    Price (KES) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="8500"
                  />
                </div>
                <div>
                  <Label>
                    Materials <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.materials}
                    onChange={(e) =>
                      setForm({ ...form, materials: e.target.value })
                    }
                    placeholder="Full-grain leather, brass hardware"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>
                      Dimensions <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={form.dimensions}
                      onChange={(e) =>
                        setForm({ ...form, dimensions: e.target.value })
                      }
                      placeholder="35 × 28 × 12 cm"
                    />
                  </div>
                  <div>
                    <Label>
                      Weight <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={form.weight}
                      onChange={(e) =>
                        setForm({ ...form, weight: e.target.value })
                      }
                      placeholder="850g"
                    />
                  </div>
                </div>
                <div>
                  <Label>
                    Craftsmanship Technique{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.craftsmanshipTechnique}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        craftsmanshipTechnique: e.target.value,
                      })
                    }
                    placeholder="Hand-stitched saddle stitch"
                  />
                </div>
                <div>
                  <Label>Origin (Optional)</Label>
                  <Input
                    value={form.origin}
                    onChange={(e) =>
                      setForm({ ...form, origin: e.target.value })
                    }
                    placeholder="Nairobi, Kenya"
                  />
                </div>
                <div>
                  <Label>Stock Quantity</Label>
                  <Input
                    type="number"
                    value={form.stockQuantity}
                    onChange={(e) =>
                      setForm({ ...form, stockQuantity: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={form.isFeatured}
                      onCheckedChange={(v) =>
                        setForm({ ...form, isFeatured: !!v })
                      }
                    />
                    <Label htmlFor="featured">Featured</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="new"
                      checked={form.isNewArrival}
                      onCheckedChange={(v) =>
                        setForm({ ...form, isNewArrival: !!v })
                      }
                    />
                    <Label htmlFor="new">New Arrival</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bestseller"
                      checked={form.isBestSeller}
                      onCheckedChange={(v) =>
                        setForm({ ...form, isBestSeller: !!v })
                      }
                    />
                    <Label htmlFor="bestseller">Best Seller</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Product Images</Label>
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  {form.imagePreviews.map((preview: any, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={preview.imageUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenCreate(false);
                setOpenEdit(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={creating || updating || !isFormValid()}
            >
              {(creating || updating) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {openCreate ? "Create Bag" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{selectedProduct?.name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteProduct(selectedProduct.id, {
                  onSuccess: () => {
                    showToast("Deleted!", "success");
                    setOpenDelete(false);
                  },
                  onError: () => showToast("Failed", "error"),
                })
              }
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
