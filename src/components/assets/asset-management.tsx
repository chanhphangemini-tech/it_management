'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  FolderOpen,
  Monitor,
  Printer,
  Smartphone,
  HardDrive,
  Headphones,
  Wifi,
  MoreVertical,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

// Types
interface AssetCategory {
  id: number
  code: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  createdAt: string
  _count?: { assets: number }
}

interface Asset {
  id: number
  assetCode: string
  name: string
  categoryId: number | null
  description: string | null
  serialNumber: string | null
  model: string | null
  purchaseDate: string | null
  purchasePrice: number | null
  status: string
  location: string | null
  notes: string | null
  createdAt: string
  category: AssetCategory | null
  creator: { id: number; username: string; fullName: string | null } | null
}

const statusOptions = [
  { value: 'available', label: 'Có sẵn', color: 'emerald' },
  { value: 'in_use', label: 'Đang sử dụng', color: 'sky' },
  { value: 'maintenance', label: 'Bảo trì', color: 'amber' },
  { value: 'disposed', label: 'Đã thanh lý', color: 'rose' },
]

const iconOptions = [
  { value: 'Monitor', label: 'Màn hình', icon: Monitor },
  { value: 'Printer', label: 'Máy in', icon: Printer },
  { value: 'Smartphone', label: 'Thiết bị di động', icon: Smartphone },
  { value: 'HardDrive', label: 'Lưu trữ', icon: HardDrive },
  { value: 'Headphones', label: 'Âm thanh', icon: Headphones },
  { value: 'Wifi', label: 'Mạng', icon: Wifi },
  { value: 'Package', label: 'Khác', icon: Package },
]

const colorOptions = [
  { value: 'rose', label: 'Rose' },
  { value: 'sky', label: 'Sky' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'amber', label: 'Amber' },
  { value: 'violet', label: 'Violet' },
  { value: 'slate', label: 'Slate' },
]

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    rose: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-700' },
    sky: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-300 dark:border-sky-700' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-700' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-700' },
    violet: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-300 dark:border-violet-700' },
    slate: { bg: 'bg-slate-100 dark:bg-slate-900/30', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700' },
  }
  return colors[color] || colors.slate
}

const getIconComponent = (iconName: string) => {
  const icon = iconOptions.find(i => i.value === iconName)
  return icon?.icon || Package
}

const getStatusBadge = (status: string) => {
  const statusOption = statusOptions.find(s => s.value === status)
  const color = statusOption?.color || 'slate'
  const colorClasses = getColorClasses(color)
  return (
    <Badge variant="outline" className={cn(colorClasses.bg, colorClasses.text, colorClasses.border)}>
      {statusOption?.label || status}
    </Badge>
  )
}

export function AssetManagement() {
  const [activeTab, setActiveTab] = useState('assets')
  
  // Assets state
  const [assets, setAssets] = useState<Asset[]>([])
  const [assetsLoading, setAssetsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  // Categories state
  const [categories, setCategories] = useState<AssetCategory[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  
  // Dialog states
  const [assetDialogOpen, setAssetDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [deleteAssetDialogOpen, setDeleteAssetDialogOpen] = useState(false)
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false)
  
  // Edit states
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null)
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<AssetCategory | null>(null)
  
  // Form states
  const [assetForm, setAssetForm] = useState({
    assetCode: '',
    name: '',
    categoryId: '',
    description: '',
    serialNumber: '',
    model: '',
    purchaseDate: '',
    purchasePrice: '',
    status: 'available',
    location: '',
    notes: '',
  })
  
  const [categoryForm, setCategoryForm] = useState({
    code: '',
    name: '',
    description: '',
    icon: 'Package',
    color: 'slate',
  })
  
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  // Fetch assets
  const fetchAssets = useCallback(async () => {
    setAssetsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterCategory !== 'all') params.append('categoryId', filterCategory)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (searchQuery) params.append('search', searchQuery)
      
      const response = await fetch(`/api/assets?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setAssets(data.data)
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setAssetsLoading(false)
    }
  }, [filterCategory, filterStatus, searchQuery])

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true)
    try {
      const response = await fetch('/api/asset-categories')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setCategoriesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssets()
    fetchCategories()
  }, [fetchAssets, fetchCategories])

  // Asset form handlers
  const handleOpenAssetDialog = (asset?: Asset) => {
    if (asset) {
      setEditingAsset(asset)
      setAssetForm({
        assetCode: asset.assetCode,
        name: asset.name,
        categoryId: asset.categoryId?.toString() || '',
        description: asset.description || '',
        serialNumber: asset.serialNumber || '',
        model: asset.model || '',
        purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
        purchasePrice: asset.purchasePrice?.toString() || '',
        status: asset.status,
        location: asset.location || '',
        notes: asset.notes || '',
      })
    } else {
      setEditingAsset(null)
      setAssetForm({
        assetCode: '',
        name: '',
        categoryId: '',
        description: '',
        serialNumber: '',
        model: '',
        purchaseDate: '',
        purchasePrice: '',
        status: 'available',
        location: '',
        notes: '',
      })
    }
    setFormError('')
    setAssetDialogOpen(true)
  }

  const handleSubmitAsset = async () => {
    if (!assetForm.assetCode || !assetForm.name) {
      setFormError('Mã tài sản và tên là bắt buộc')
      return
    }

    setFormLoading(true)
    setFormError('')

    try {
      const url = editingAsset ? `/api/assets/${editingAsset.id}` : '/api/assets'
      const method = editingAsset ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...assetForm,
          categoryId: assetForm.categoryId || null,
          purchaseDate: assetForm.purchaseDate || null,
          purchasePrice: assetForm.purchasePrice || null,
          createdBy: 1, // Default user
        }),
      })

      const data = await response.json()

      if (data.success) {
        setAssetDialogOpen(false)
        fetchAssets()
      } else {
        setFormError(data.error || 'Không thể lưu tài sản')
      }
    } catch {
      setFormError('Không thể lưu tài sản')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteAsset = async () => {
    if (!deletingAsset) return

    setFormLoading(true)
    try {
      const response = await fetch(`/api/assets/${deletingAsset.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setDeleteAssetDialogOpen(false)
        setDeletingAsset(null)
        fetchAssets()
      }
    } catch (error) {
      console.error('Error deleting asset:', error)
    } finally {
      setFormLoading(false)
    }
  }

  // Category form handlers
  const handleOpenCategoryDialog = (category?: AssetCategory) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({
        code: category.code,
        name: category.name,
        description: category.description || '',
        icon: category.icon || 'Package',
        color: category.color || 'slate',
      })
    } else {
      setEditingCategory(null)
      setCategoryForm({
        code: '',
        name: '',
        description: '',
        icon: 'Package',
        color: 'slate',
      })
    }
    setFormError('')
    setCategoryDialogOpen(true)
  }

  const handleSubmitCategory = async () => {
    if (!categoryForm.code || !categoryForm.name) {
      setFormError('Mã và tên là bắt buộc')
      return
    }

    setFormLoading(true)
    setFormError('')

    try {
      // For categories, we only support creation (no update endpoint)
      const response = await fetch('/api/asset-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      })

      const data = await response.json()

      if (data.success) {
        setCategoryDialogOpen(false)
        fetchCategories()
      } else {
        setFormError(data.error || 'Không thể lưu danh mục')
      }
    } catch {
      setFormError('Không thể lưu danh mục')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Quản lý tài sản</h2>
          <p className="text-muted-foreground">Quản lý tài sản công ty</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex-wrap h-auto gap-1 p-1 bg-muted/50">
          <TabsTrigger value="assets" className="data-[state=active]:bg-background">
            <Package className="h-4 w-4 mr-2" />
            Tài sản
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-background">
            <FolderOpen className="h-4 w-4 mr-2" />
            Danh mục
          </TabsTrigger>
        </TabsList>

        {/* Assets Tab */}
        <TabsContent value="assets" className="mt-0 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm tài sản..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                        onClick={() => setSearchQuery('')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Tất cả danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => handleOpenAssetDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm tài sản
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assets Table */}
          <Card>
            <CardContent className="p-0">
              {assetsLoading ? (
                <div className="p-4 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : assets.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Không tìm thấy tài sản</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterCategory !== 'all' || filterStatus !== 'all'
                      ? 'Thử thay đổi bộ lọc'
                      : 'Bắt đầu bằng cách tạo tài sản đầu tiên'}
                  </p>
                  <Button onClick={() => handleOpenAssetDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm tài sản
                  </Button>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã tài sản</TableHead>
                        <TableHead>Tên</TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Vị trí</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-mono font-medium">
                            {asset.assetCode}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{asset.name}</p>
                              {asset.model && (
                                <p className="text-xs text-muted-foreground">{asset.model}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {asset.category ? (
                              <Badge
                                variant="outline"
                                className={cn(
                                  getColorClasses(asset.category.color || 'slate').bg,
                                  getColorClasses(asset.category.color || 'slate').text
                                )}
                              >
                                {asset.category.name}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(asset.status)}</TableCell>
                          <TableCell>{asset.location || '-'}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenAssetDialog(asset)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-rose-600"
                                  onClick={() => {
                                    setDeletingAsset(asset)
                                    setDeleteAssetDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="mt-0 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => handleOpenCategoryDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm danh mục
            </Button>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Không tìm thấy danh mục</h3>
                <p className="text-muted-foreground mb-4">
                  Bắt đầu bằng cách tạo danh mục đầu tiên
                </p>
                <Button onClick={() => handleOpenCategoryDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm danh mục
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const IconComponent = getIconComponent(category.icon || 'Package')
                const colorClasses = getColorClasses(category.color || 'slate')
                
                return (
                  <Card key={category.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className={cn('p-3 rounded-lg', colorClasses.bg)}>
                          <IconComponent className={cn('h-6 w-6', colorClasses.text)} />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenCategoryDialog(category)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-rose-600"
                              onClick={() => {
                                setDeletingCategory(category)
                                setDeleteCategoryDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {category.description || category.code}
                      </CardDescription>
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {category._count?.assets || 0} tài sản
                        </Badge>
                        <Badge variant="outline" className="text-xs font-mono">
                          {category.code}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Asset Dialog */}
      <Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAsset ? 'Sửa tài sản' : 'Thêm tài sản mới'}
            </DialogTitle>
            <DialogDescription>
              {editingAsset ? 'Cập nhật thông tin tài sản' : 'Điền thông tin tài sản'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {formError && (
              <div className="p-3 text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assetCode">Mã tài sản *</Label>
                <Input
                  id="assetCode"
                  value={assetForm.assetCode}
                  onChange={(e) => setAssetForm({ ...assetForm, assetCode: e.target.value })}
                  placeholder="VD: LAPTOP-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Tên *</Label>
                <Input
                  id="name"
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  placeholder="VD: Dell Latitude 5520"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select
                  value={assetForm.categoryId}
                  onValueChange={(value) => setAssetForm({ ...assetForm, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={assetForm.status}
                  onValueChange={(value) => setAssetForm({ ...assetForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={assetForm.description}
                onChange={(e) => setAssetForm({ ...assetForm, description: e.target.value })}
                placeholder="Mô tả tài sản..."
                rows={2}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Số serial</Label>
                <Input
                  id="serialNumber"
                  value={assetForm.serialNumber}
                  onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                  placeholder="Số serial"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={assetForm.model}
                  onChange={(e) => setAssetForm({ ...assetForm, model: e.target.value })}
                  placeholder="Model"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Ngày mua</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={assetForm.purchaseDate}
                  onChange={(e) => setAssetForm({ ...assetForm, purchaseDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Giá mua</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={assetForm.purchasePrice}
                  onChange={(e) => setAssetForm({ ...assetForm, purchasePrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Vị trí</Label>
              <Input
                id="location"
                value={assetForm.location}
                onChange={(e) => setAssetForm({ ...assetForm, location: e.target.value })}
                placeholder="VD: Văn phòng A, Phòng 101"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={assetForm.notes}
                onChange={(e) => setAssetForm({ ...assetForm, notes: e.target.value })}
                placeholder="Ghi chú thêm..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssetDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmitAsset} disabled={formLoading}>
              {formLoading ? 'Đang lưu...' : editingAsset ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onValueChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Cập nhật thông tin danh mục' : 'Tạo danh mục tài sản mới'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {formError && (
              <div className="p-3 text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryCode">Mã *</Label>
                <Input
                  id="categoryCode"
                  value={categoryForm.code}
                  onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value.toUpperCase() })}
                  placeholder="VD: LAPTOP"
                  disabled={!!editingCategory}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryName">Tên *</Label>
                <Input
                  id="categoryName"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="VD: Máy tính xách tay"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Mô tả</Label>
              <Textarea
                id="categoryDescription"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Mô tả danh mục..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryIcon">Biểu tượng</Label>
                <Select
                  value={categoryForm.icon}
                  onValueChange={(value) => setCategoryForm({ ...categoryForm, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn biểu tượng" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center gap-2">
                          <icon.icon className="h-4 w-4" />
                          <span>{icon.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryColor">Màu sắc</Label>
                <Select
                  value={categoryForm.color}
                  onValueChange={(value) => setCategoryForm({ ...categoryForm, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn màu sắc" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={cn('w-4 h-4 rounded-full', getColorClasses(color.value).bg)} />
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmitCategory} disabled={formLoading}>
              {formLoading ? 'Đang lưu...' : editingCategory ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Asset Confirmation */}
      <AlertDialog open={deleteAssetDialogOpen} onOpenChange={setDeleteAssetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tài sản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài sản &quot;{deletingAsset?.name}&quot;? Hành động này
              không thể hoàn tác và sẽ xóa tất cả các phân công và giao dịch liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingAsset(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAsset}
              disabled={formLoading}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {formLoading ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={deleteCategoryDialogOpen} onOpenChange={setDeleteCategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục &quot;{deletingCategory?.name}&quot;?
              Tài sản trong danh mục này sẽ không bị xóa nhưng sẽ trở về trạng thái chưa phân loại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingCategory(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={formLoading}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {formLoading ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
