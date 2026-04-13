'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Network,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Cable,
  Server,
  Router,
  Wifi,
  Battery,
  Video,
  Monitor,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Link2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

// Types
interface NetDevice {
  id: number
  name: string
  ip: string | null
  location: string | null
  description: string | null
  deviceType: string | null
  status: string
  company: string | null
  serialNumber: string | null
  modelDetails: string | null
  purchaseDate: string | null
  condition: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    cablesFrom: number
    cablesTo: number
  }
}

interface NetCable {
  id: number
  label: string
  cableType: string | null
  fromDeviceId: number | null
  toDeviceId: number | null
  fromDeviceName: string | null
  toDeviceName: string | null
  description: string | null
  createdAt: string
  updatedAt: string
  fromDevice?: {
    id: number
    name: string
    ip: string | null
    deviceType: string | null
  } | null
  toDevice?: {
    id: number
    name: string
    ip: string | null
    deviceType: string | null
  } | null
}

// Device type options
const DEVICE_TYPES = [
  { value: 'server', label: 'Máy chủ', icon: Server },
  { value: 'modem', label: 'Modem', icon: Wifi },
  { value: 'router', label: 'Bộ định tuyến', icon: Router },
  { value: 'switch', label: 'Switch', icon: Network },
  { value: 'ups', label: 'UPS', icon: Battery },
  { value: 'nvr', label: 'NVR', icon: Video },
  { value: 'camera', label: 'Camera', icon: Video },
  { value: 'workstation', label: 'Trạm làm việc', icon: Monitor },
  { value: 'other', label: 'Khác', icon: Monitor },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Hoạt động', color: 'emerald' },
  { value: 'inactive', label: 'Không hoạt động', color: 'gray' },
  { value: 'maintenance', label: 'Bảo trì', color: 'amber' },
  { value: 'faulty', label: 'Lỗi', color: 'rose' },
]

const CABLE_TYPES = [
  { value: 'Cat5e', label: 'Cat5e' },
  { value: 'Cat6', label: 'Cat6' },
  { value: 'Cat6a', label: 'Cat6a' },
  { value: 'Fiber', label: 'Fiber' },
  { value: 'DAC', label: 'DAC' },
  { value: 'Power', label: 'Power' },
  { value: 'Coaxial', label: 'Coaxial' },
  { value: 'Other', label: 'Other' },
]

// Initial form states
const initialDeviceForm = {
  name: '',
  ip: '',
  location: '',
  description: '',
  deviceType: '',
  status: 'active',
  company: '',
  serialNumber: '',
  modelDetails: '',
  purchaseDate: '',
  condition: '',
}

const initialCableForm = {
  label: '',
  cableType: '',
  fromDeviceId: '',
  toDeviceId: '',
  fromDeviceName: '',
  toDeviceName: '',
  description: '',
}

// Helper functions
const getDeviceTypeIcon = (type: string | null) => {
  const deviceType = DEVICE_TYPES.find((t) => t.value === type)
  return deviceType?.icon || Monitor
}

const getStatusColor = (status: string) => {
  const statusOption = STATUS_OPTIONS.find((s) => s.value === status)
  return statusOption?.color || 'gray'
}

export default function NetworkManager() {
  // State
  const [devices, setDevices] = useState<NetDevice[]>([])
  const [cables, setCables] = useState<NetCable[]>([])
  const [loading, setLoading] = useState(true)
  const [cablesLoading, setCablesLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('devices')

  // Device filters
  const [deviceSearch, setDeviceSearch] = useState('')
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>('all')
  const [deviceStatusFilter, setDeviceStatusFilter] = useState<string>('all')
  const [deviceLocationFilter, setDeviceLocationFilter] = useState('')

  // Cable filters
  const [cableSearch, setCableSearch] = useState('')

  // Dialogs
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false)
  const [cableDialogOpen, setCableDialogOpen] = useState(false)
  const [deleteDeviceDialogOpen, setDeleteDeviceDialogOpen] = useState(false)
  const [deleteCableDialogOpen, setDeleteCableDialogOpen] = useState(false)

  // Forms
  const [deviceForm, setDeviceForm] = useState(initialDeviceForm)
  const [cableForm, setCableForm] = useState(initialCableForm)
  const [editingDevice, setEditingDevice] = useState<NetDevice | null>(null)
  const [deletingDevice, setDeletingDevice] = useState<NetDevice | null>(null)
  const [deletingCable, setDeletingCable] = useState<NetCable | null>(null)

  // Form submission
  const [submitting, setSubmitting] = useState(false)

  // Fetch devices
  const fetchDevices = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (deviceSearch) params.append('search', deviceSearch)
      if (deviceTypeFilter && deviceTypeFilter !== 'all') params.append('deviceType', deviceTypeFilter)
      if (deviceStatusFilter && deviceStatusFilter !== 'all') params.append('status', deviceStatusFilter)
      if (deviceLocationFilter) params.append('location', deviceLocationFilter)

      const response = await fetch(`/api/net-devices?${params.toString()}`)
      const data = await response.json()
      if (data.success) {
        setDevices(data.data)
      }
    } catch (error) {
      console.error('Error fetching devices:', error)
    } finally {
      setLoading(false)
    }
  }, [deviceSearch, deviceTypeFilter, deviceStatusFilter, deviceLocationFilter])

  // Fetch cables
  const fetchCables = useCallback(async () => {
    setCablesLoading(true)
    try {
      const params = new URLSearchParams()
      if (cableSearch) params.append('search', cableSearch)

      const response = await fetch(`/api/net-cables?${params.toString()}`)
      const data = await response.json()
      if (data.success) {
        setCables(data.data)
      }
    } catch (error) {
      console.error('Error fetching cables:', error)
    } finally {
      setCablesLoading(false)
    }
  }, [cableSearch])

  useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  useEffect(() => {
    if (activeTab === 'cables') {
      fetchCables()
    }
  }, [activeTab, fetchCables])

  // Device handlers
  const handleOpenDeviceDialog = (device?: NetDevice) => {
    if (device) {
      setEditingDevice(device)
      setDeviceForm({
        name: device.name,
        ip: device.ip || '',
        location: device.location || '',
        description: device.description || '',
        deviceType: device.deviceType || '',
        status: device.status,
        company: device.company || '',
        serialNumber: device.serialNumber || '',
        modelDetails: device.modelDetails || '',
        purchaseDate: device.purchaseDate || '',
        condition: device.condition || '',
      })
    } else {
      setEditingDevice(null)
      setDeviceForm(initialDeviceForm)
    }
    setDeviceDialogOpen(true)
  }

  const handleSubmitDevice = async () => {
    if (!deviceForm.name.trim()) return

    setSubmitting(true)
    try {
      const url = editingDevice ? `/api/net-devices/${editingDevice.id}` : '/api/net-devices'
      const method = editingDevice ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceForm),
      })

      const data = await response.json()
      if (data.success) {
        setDeviceDialogOpen(false)
        setDeviceForm(initialDeviceForm)
        setEditingDevice(null)
        fetchDevices()
      }
    } catch (error) {
      console.error('Error saving device:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteDevice = async () => {
    if (!deletingDevice) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/net-devices/${deletingDevice.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        setDeleteDeviceDialogOpen(false)
        setDeletingDevice(null)
        fetchDevices()
      }
    } catch (error) {
      console.error('Error deleting device:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Cable handlers
  const handleOpenCableDialog = () => {
    setCableForm(initialCableForm)
    setCableDialogOpen(true)
  }

  const handleSubmitCable = async () => {
    if (!cableForm.label.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/net-cables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cableForm),
      })

      const data = await response.json()
      if (data.success) {
        setCableDialogOpen(false)
        setCableForm(initialCableForm)
        fetchCables()
      }
    } catch (error) {
      console.error('Error saving cable:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCable = async () => {
    if (!deletingCable) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/net-cables/${deletingCable.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        setDeleteCableDialogOpen(false)
        setDeletingCable(null)
        fetchCables()
      }
    } catch (error) {
      console.error('Error deleting cable:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Get unique locations for filter
  const uniqueLocations = Array.from(new Set(devices.map((d) => d.location).filter(Boolean)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6" />
            Quản lý mạng
          </h2>
          <p className="text-muted-foreground">Quản lý thiết bị mạng và kết nối</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchDevices()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex-wrap h-auto gap-1 p-1 bg-muted/50">
          <TabsTrigger value="devices" className="data-[state=active]:bg-background">
            <Server className="h-4 w-4 mr-2" />
            Thiết bị ({devices.length})
          </TabsTrigger>
          <TabsTrigger value="cables" className="data-[state=active]:bg-background">
            <Cable className="h-4 w-4 mr-2" />
            Cáp ({cables.length})
          </TabsTrigger>
        </TabsList>

        {/* Devices Tab */}
        <TabsContent value="devices" className="mt-0 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm thiết bị..."
                    value={deviceSearch}
                    onChange={(e) => setDeviceSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={deviceTypeFilter} onValueChange={setDeviceTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Loại thiết bị" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    {DEVICE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={deviceStatusFilter} onValueChange={setDeviceStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={deviceLocationFilter} onValueChange={setDeviceLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vị trí" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả vị trí</SelectItem>
                    {uniqueLocations.map((loc) => (
                      <SelectItem key={loc} value={loc || ''}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={() => handleOpenDeviceDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm thiết bị
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Devices Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : devices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Server className="h-12 w-12 mb-4 opacity-50" />
                  <p>Không tìm thấy thiết bị</p>
                  <Button variant="outline" className="mt-4" onClick={() => handleOpenDeviceDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm thiết bị đầu tiên
                  </Button>
                </div>
              ) : (
                <ScrollArea className="max-h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên</TableHead>
                        <TableHead>Địa chỉ IP</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Vị trí</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Kết nối</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {devices.map((device) => {
                        const DeviceIcon = getDeviceTypeIcon(device.deviceType)
                        const statusColor = getStatusColor(device.status)
                        return (
                          <TableRow key={device.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-muted">
                                  <DeviceIcon className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium">{device.name}</p>
                                  {device.serialNumber && (
                                    <p className="text-xs text-muted-foreground">
                                      S/N: {device.serialNumber}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {device.ip || '-'}
                              </code>
                            </TableCell>
                            <TableCell>
                              {device.deviceType ? (
                                <Badge variant="outline" className="capitalize">
                                  {device.deviceType}
                                </Badge>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>{device.location || '-'}</TableCell>
                            <TableCell>
                              <Badge
                                className={cn(
                                  'capitalize',
                                  statusColor === 'emerald' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
                                  statusColor === 'gray' && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                                  statusColor === 'amber' && 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
                                  statusColor === 'rose' && 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300'
                                )}
                              >
                                {device.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Link2 className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">
                                  {(device._count?.cablesFrom || 0) + (device._count?.cablesTo || 0)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDeviceDialog(device)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                  onClick={() => {
                                    setDeletingDevice(device)
                                    setDeleteDeviceDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cables Tab */}
        <TabsContent value="cables" className="mt-0 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm cáp..."
                    value={cableSearch}
                    onChange={(e) => setCableSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button onClick={handleOpenCableDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm cáp
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cables List */}
          <Card>
            <CardContent className="p-0">
              {cablesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : cables.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Cable className="h-12 w-12 mb-4 opacity-50" />
                  <p>Không tìm thấy cáp</p>
                  <Button variant="outline" className="mt-4" onClick={handleOpenCableDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm cáp đầu tiên
                  </Button>
                </div>
              ) : (
                <ScrollArea className="max-h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nhãn</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Từ thiết bị</TableHead>
                        <TableHead>Đến thiết bị</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cables.map((cable) => (
                        <TableRow key={cable.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Cable className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{cable.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {cable.cableType ? (
                              <Badge variant="outline">{cable.cableType}</Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {cable.fromDevice ? (
                              <div className="flex items-center gap-2">
                                <ChevronLeft className="h-3 w-3 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">{cable.fromDevice.name}</p>
                                  {cable.fromDevice.ip && (
                                    <p className="text-xs text-muted-foreground">
                                      {cable.fromDevice.ip}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : cable.fromDeviceName ? (
                              <span className="text-sm">{cable.fromDeviceName}</span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {cable.toDevice ? (
                              <div className="flex items-center gap-2">
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">{cable.toDevice.name}</p>
                                  {cable.toDevice.ip && (
                                    <p className="text-xs text-muted-foreground">
                                      {cable.toDevice.ip}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : cable.toDeviceName ? (
                              <span className="text-sm">{cable.toDeviceName}</span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {cable.description || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                              onClick={() => {
                                setDeletingCable(cable)
                                setDeleteCableDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
      </Tabs>

      {/* Device Dialog */}
      <Dialog open={deviceDialogOpen} onOpenChange={setDeviceDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDevice ? 'Sửa thiết bị' : 'Thêm thiết bị mới'}
            </DialogTitle>
            <DialogDescription>
              {editingDevice ? 'Cập nhật thông tin thiết bị' : 'Thêm thiết bị mạng mới vào danh sách'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên *</Label>
              <Input
                id="name"
                value={deviceForm.name}
                onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                placeholder="Tên thiết bị"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ip">Địa chỉ IP</Label>
              <Input
                id="ip"
                value={deviceForm.ip}
                onChange={(e) => setDeviceForm({ ...deviceForm, ip: e.target.value })}
                placeholder="192.168.1.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deviceType">Loại thiết bị</Label>
              <Select
                value={deviceForm.deviceType}
                onValueChange={(value) => setDeviceForm({ ...deviceForm, deviceType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  {DEVICE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={deviceForm.status}
                onValueChange={(value) => setDeviceForm({ ...deviceForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Vị trí</Label>
              <Input
                id="location"
                value={deviceForm.location}
                onChange={(e) => setDeviceForm({ ...deviceForm, location: e.target.value })}
                placeholder="Phòng máy chủ A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Nhà cung cấp</Label>
              <Input
                id="company"
                value={deviceForm.company}
                onChange={(e) => setDeviceForm({ ...deviceForm, company: e.target.value })}
                placeholder="Dell, HP, Cisco..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Số serial</Label>
              <Input
                id="serialNumber"
                value={deviceForm.serialNumber}
                onChange={(e) => setDeviceForm({ ...deviceForm, serialNumber: e.target.value })}
                placeholder="SN123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelDetails">Chi tiết model</Label>
              <Input
                id="modelDetails"
                value={deviceForm.modelDetails}
                onChange={(e) => setDeviceForm({ ...deviceForm, modelDetails: e.target.value })}
                placeholder="Số model"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Ngày mua</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={deviceForm.purchaseDate}
                onChange={(e) => setDeviceForm({ ...deviceForm, purchaseDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Tình trạng</Label>
              <Select
                value={deviceForm.condition}
                onValueChange={(value) => setDeviceForm({ ...deviceForm, condition: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tình trạng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Mới</SelectItem>
                  <SelectItem value="good">Tốt</SelectItem>
                  <SelectItem value="fair">Khá</SelectItem>
                  <SelectItem value="poor">Kém</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={deviceForm.description}
                onChange={(e) => setDeviceForm({ ...deviceForm, description: e.target.value })}
                placeholder="Ghi chú thêm về thiết bị..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeviceDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmitDevice} disabled={submitting || !deviceForm.name.trim()}>
              {submitting ? 'Đang lưu...' : editingDevice ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cable Dialog */}
      <Dialog open={cableDialogOpen} onOpenChange={setCableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm cáp mới</DialogTitle>
            <DialogDescription>
              Tạo kết nối cáp mới giữa các thiết bị
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cableLabel">Nhãn *</Label>
              <Input
                id="cableLabel"
                value={cableForm.label}
                onChange={(e) => setCableForm({ ...cableForm, label: e.target.value })}
                placeholder="Nhãn hoặc ID cáp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cableType">Loại cáp</Label>
              <Select
                value={cableForm.cableType}
                onValueChange={(value) => setCableForm({ ...cableForm, cableType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  {CABLE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromDeviceId">Từ thiết bị</Label>
              <Select
                value={cableForm.fromDeviceId}
                onValueChange={(value) => {
                  const device = devices.find((d) => d.id.toString() === value)
                  setCableForm({
                    ...cableForm,
                    fromDeviceId: value,
                    fromDeviceName: device?.name || '',
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thiết bị nguồn" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id.toString()}>
                      {device.name} {device.ip && `(${device.ip})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="toDeviceId">Đến thiết bị</Label>
              <Select
                value={cableForm.toDeviceId}
                onValueChange={(value) => {
                  const device = devices.find((d) => d.id.toString() === value)
                  setCableForm({
                    ...cableForm,
                    toDeviceId: value,
                    toDeviceName: device?.name || '',
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thiết bị đích" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id.toString()}>
                      {device.name} {device.ip && `(${device.ip})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cableDescription">Mô tả</Label>
              <Textarea
                id="cableDescription"
                value={cableForm.description}
                onChange={(e) => setCableForm({ ...cableForm, description: e.target.value })}
                placeholder="Ghi chú thêm..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCableDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmitCable} disabled={submitting || !cableForm.label.trim()}>
              {submitting ? 'Đang tạo...' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Device Confirmation */}
      <AlertDialog open={deleteDeviceDialogOpen} onOpenChange={setDeleteDeviceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thiết bị</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa "{deletingDevice?.name}"? Điều này sẽ xóa tất cả cáp kết nối đến thiết bị này. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDevice}
              disabled={submitting}
              className="bg-rose-500 hover:bg-rose-600"
            >
              {submitting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Cable Confirmation */}
      <AlertDialog open={deleteCableDialogOpen} onOpenChange={setDeleteCableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa cáp</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa cáp "{deletingCable?.label}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCable}
              disabled={submitting}
              className="bg-rose-500 hover:bg-rose-600"
            >
              {submitting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
