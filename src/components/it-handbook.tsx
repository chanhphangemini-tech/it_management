'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  User,
  Calendar,
  Tag,
  Filter,
  Eye,
  Info,
  ShieldCheck,
  Stethoscope,
  Copy,
  Check,
  Download,
  BarChart3,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import { Separator } from '@/components/ui/separator'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

// Types
interface Category {
  code: string
  name: string
  icon?: string | null
  description?: string | null
  color?: string | null
  _count?: {
    cases: number
    workLogs: number
  }
}

interface CaseItem {
  id: number
  title: string
  category?: string | null
  description?: string | null
  symptoms?: string | null
  rootCause?: string | null
  solution?: string | null
  prevention?: string | null
  status: string
  createdAt: string
  updatedAt: string
  categoryRel?: Category | null
  _count?: {
    worklogs: number
  }
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface WorklogStats {
  total: number
  byCategory: { category: string; _count: number }[]
  byStatus: { status: string; _count: number }[]
  byPriority: { priority: string; _count: number }[]
  byWorkStatus: { workStatus: string; _count: number }[]
  byMonth: { month: string; count: number }[]
}

interface WorklogItem {
  id: number
  title: string
  category?: string | null
  description?: string | null
  timeSpent?: string | null
  status: string
  success: boolean
  tags: string
  clientName?: string | null
  caseTitle?: string | null
  issueDescription?: string | null
  solutionApplied?: string | null
  result?: string | null
  priority: string
  workStatus: string
  date?: string | null
  createdAt: string
  updatedAt: string
  userId?: number | null
  caseId?: number | null
  user?: {
    id: number
    username: string
    fullName?: string | null
  } | null
  caseRel?: {
    id: number
    title: string
  } | null
}

// Status configurations
const caseStatusConfig = {
  Active: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', icon: CheckCircle2 },
  Draft: { color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: FileText },
  Archived: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', icon: Clock },
}

const worklogStatusConfig = {
  in_progress: { color: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300', icon: Clock },
  completed: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', icon: CheckCircle2 },
  pending: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', icon: AlertCircle },
  cancelled: { color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300', icon: XCircle },
}

const priorityConfig = {
  Low: { color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  Medium: { color: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300' },
  High: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  Critical: { color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300' },
}

const workStatusConfig = {
  completed: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  in_progress: { color: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300' },
  pending: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  failed: { color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300' },
}

// Initial form states
const initialCaseForm = {
  title: '',
  category: '',
  description: '',
  symptoms: '',
  rootCause: '',
  solution: '',
  prevention: '',
  status: 'Active',
}

const initialWorklogForm = {
  title: '',
  category: '',
  clientName: '',
  issueDescription: '',
  solutionApplied: '',
  timeSpent: '',
  result: 'Resolved',
  priority: 'Medium',
  workStatus: 'completed',
  date: new Date().toISOString().split('T')[0],
  description: '',
}

// Helper function for Vietnamese category names
const getCategoryName = (code: string) => {
  const labels: Record<string, string> = {
    'database': 'Cơ sở dữ liệu',
    'application': 'Ứng dụng',
    'user-support': 'Hỗ trợ người dùng',
    'hardware': 'Phần cứng',
    'other': 'Khác',
    'network': 'Mạng',
    'server': 'Máy chủ',
    'printer': 'Máy in',
    'storage': 'Lưu trữ',
    'virtualization': 'Ảo hóa',
    'system': 'Hệ thống',
    'security': 'Bảo mật',
  }
  return labels[code] || code
}

// Helper functions for Vietnamese labels
const getCaseStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'Active': 'Hoạt động',
    'Draft': 'Nháp',
    'Archived': 'Lưu trữ',
  }
  return labels[status] || status
}

const getWorklogStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'in_progress': 'Đang xử lý',
    'completed': 'Hoàn thành',
    'pending': 'Chờ xử lý',
    'cancelled': 'Đã hủy',
  }
  return labels[status] || status
}

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    'Low': 'Thấp',
    'Medium': 'Trung bình',
    'High': 'Cao',
    'Critical': 'Khẩn cấp',
  }
  return labels[priority] || priority
}

const getWorkStatusLabel = (workStatus: string) => {
  const labels: Record<string, string> = {
    'completed': 'Hoàn thành',
    'in_progress': 'Đang xử lý',
    'pending': 'Chờ xử lý',
    'failed': 'Thất bại',
  }
  return labels[workStatus] || workStatus
}

export default function ITHandbook() {
  // State
  const [activeTab, setActiveTab] = useState('cases')
  const [categories, setCategories] = useState<Category[]>([])
  const [cases, setCases] = useState<CaseItem[]>([])
  const [worklogs, setWorklogs] = useState<WorklogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Pagination state
  const [casesPage, setCasesPage] = useState(1)
  const [casesTotal, setCasesTotal] = useState(0)
  const [casesTotalPages, setCasesTotalPages] = useState(1)
  const [worklogsPage, setWorklogsPage] = useState(1)
  const [worklogsTotal, setWorklogsTotal] = useState(0)
  const [worklogsTotalPages, setWorklogsTotalPages] = useState(1)
  const PAGE_LIMIT = 10

  // Worklog stats state
  const [worklogStats, setWorklogStats] = useState<WorklogStats | null>(null)

  // Dialog states
  const [caseDialogOpen, setCaseDialogOpen] = useState(false)
  const [worklogDialogOpen, setWorklogDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCase, setEditingCase] = useState<CaseItem | null>(null)
  const [editingWorklog, setEditingWorklog] = useState<WorklogItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'case' | 'worklog', id: number } | null>(null)
  const [saving, setSaving] = useState(false)

  // Case Detail State
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null)
  const [copied, setCopied] = useState(false)

  // Form states
  const [caseForm, setCaseForm] = useState(initialCaseForm)
  const [worklogForm, setWorklogForm] = useState(initialWorklogForm)

  // Fetch data
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [])

  const fetchCases = useCallback(async (page?: number) => {
    try {
      const p = page ?? casesPage
      const params = new URLSearchParams()
      if (categoryFilter !== 'all') params.append('category', categoryFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)
      params.append('page', String(p))
      params.append('limit', String(PAGE_LIMIT))

      const res = await fetch(`/api/cases?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setCases(data.data)
        if (data.pagination) {
          setCasesTotal(data.pagination.total)
          setCasesTotalPages(data.pagination.totalPages)
          setCasesPage(data.pagination.page)
        }
      }
    } catch (error) {
      console.error('Error fetching cases:', error)
    }
  }, [categoryFilter, statusFilter, searchTerm])

  const fetchWorklogs = useCallback(async (page?: number) => {
    try {
      const p = page ?? worklogsPage
      const params = new URLSearchParams()
      if (categoryFilter !== 'all') params.append('category', categoryFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)
      params.append('page', String(p))
      params.append('limit', String(PAGE_LIMIT))

      const res = await fetch(`/api/worklogs?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setWorklogs(data.data)
        if (data.pagination) {
          setWorklogsTotal(data.pagination.total)
          setWorklogsTotalPages(data.pagination.totalPages)
          setWorklogsPage(data.pagination.page)
        }
      }
    } catch (error) {
      console.error('Error fetching worklogs:', error)
    }
  }, [categoryFilter, statusFilter, searchTerm])

  const fetchWorklogStats = useCallback(async () => {
    try {
      const res = await fetch('/api/worklogs/stats')
      const data = await res.json()
      if (data.success) {
        setWorklogStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching worklog stats:', error)
    }
  }, [])

  const handleExportWorklogs = useCallback(() => {
    toast.success('Đang xuất dữ liệu...')
    window.open('/api/worklogs/export', '_blank')
  }, [])

  useEffect(() => {
    fetchCategories()
    fetchWorklogStats()
  }, [fetchCategories, fetchWorklogStats])

  // Reset page when filters change
  useEffect(() => {
    setCasesPage(1)
    setWorklogsPage(1)
  }, [categoryFilter, statusFilter, searchTerm])

  useEffect(() => {
    setLoading(true)
    if (activeTab === 'cases') {
      fetchCases(1).finally(() => setLoading(false))
    } else {
      fetchWorklogs(1).finally(() => setLoading(false))
    }
  }, [activeTab, fetchCases, fetchWorklogs])

  // Handlers
  const handleCreateCase = () => {
    setEditingCase(null)
    setCaseForm(initialCaseForm)
    setCaseDialogOpen(true)
  }

  const handleEditCase = (caseItem: CaseItem) => {
    setEditingCase(caseItem)
    setCaseForm({
      title: caseItem.title,
      category: caseItem.category || '',
      description: caseItem.description || '',
      symptoms: caseItem.symptoms || '',
      rootCause: caseItem.rootCause || '',
      solution: caseItem.solution || '',
      prevention: caseItem.prevention || '',
      status: caseItem.status,
    })
    setCaseDialogOpen(true)
  }

  const handleViewCase = (caseItem: CaseItem) => {
    setSelectedCase(caseItem)
    setDetailDialogOpen(true)
    setCopied(false)
  }

  const handleSaveCase = async () => {
    if (!caseForm.title.trim()) return

    setSaving(true)
    try {
      const url = editingCase ? `/api/cases/${editingCase.id}` : '/api/cases'
      const method = editingCase ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caseForm),
      })

      const data = await res.json()
      if (data.success) {
        setCaseDialogOpen(false)
        fetchCases()
      }
    } catch (error) {
      console.error('Error saving case:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateWorklog = () => {
    setEditingWorklog(null)
    setWorklogForm(initialWorklogForm)
    setWorklogDialogOpen(true)
  }

  const handleEditWorklog = (worklog: WorklogItem) => {
    setEditingWorklog(worklog)
    setWorklogForm({
      title: worklog.title,
      category: worklog.category || '',
      clientName: worklog.clientName || '',
      issueDescription: worklog.issueDescription || '',
      solutionApplied: worklog.solutionApplied || '',
      timeSpent: worklog.timeSpent || '',
      result: worklog.result || 'Resolved',
      priority: worklog.priority,
      workStatus: worklog.workStatus,
      date: worklog.date ? new Date(worklog.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: worklog.description || '',
    })
    setWorklogDialogOpen(true)
  }

  const handleSaveWorklog = async () => {
    if (!worklogForm.title.trim()) return

    setSaving(true)
    try {
      const url = editingWorklog ? `/api/worklogs/${editingWorklog.id}` : '/api/worklogs'
      const method = editingWorklog ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(worklogForm),
      })

      const data = await res.json()
      if (data.success) {
        setWorklogDialogOpen(false)
        fetchWorklogs()
        fetchWorklogStats()
      }
    } catch (error) {
      console.error('Error saving worklog:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setSaving(true)
    try {
      const url = deleteTarget.type === 'case' 
        ? `/api/cases/${deleteTarget.id}` 
        : `/api/worklogs/${deleteTarget.id}`

      const res = await fetch(url, { method: 'DELETE' })
      const data = await res.json()

      if (data.success) {
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
        if (deleteTarget.type === 'case') {
          fetchCases()
        } else {
          fetchWorklogs()
          fetchWorklogStats()
        }
      }
    } catch (error) {
      console.error('Error deleting:', error)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-rose-500" />
            Sổ tay IT
          </h2>
          <p className="text-muted-foreground">Quản lý Cases và Worklogs</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1 p-1 bg-muted/50">
          <TabsTrigger value="cases" className="data-[state=active]:bg-background">
            <FileText className="h-4 w-4 mr-2" />
            Cases ({casesTotal})
          </TabsTrigger>
          <TabsTrigger value="worklogs" className="data-[state=active]:bg-background">
            <Clock className="h-4 w-4 mr-2" />
            Worklogs ({worklogsTotal})
          </TabsTrigger>
        </TabsList>

        {/* Common Filters */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.code} value={cat.code}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {activeTab === 'cases' ? (
                    <>
                      <SelectItem value="Active">Hoạt động</SelectItem>
                      <SelectItem value="Draft">Nháp</SelectItem>
                      <SelectItem value="Archived">Lưu trữ</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="in_progress">Đang xử lý</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="pending">Chờ xử lý</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <Button onClick={activeTab === 'cases' ? handleCreateCase : handleCreateWorklog}>
                <Plus className="h-4 w-4 mr-2" />
                {activeTab === 'cases' ? 'Thêm Case' : 'Thêm Worklog'}
              </Button>
              {activeTab === 'worklogs' && (
                <Button variant="outline" onClick={handleExportWorklogs}>
                  <Download className="h-4 w-4 mr-2" />
                  Xuất CSV
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cases Tab */}
        <TabsContent value="cases" className="mt-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : cases.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Không có case nào</p>
                <Button variant="outline" className="mt-4" onClick={handleCreateCase}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo case đầu tiên
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cases.map((caseItem) => {
                const StatusIcon = caseStatusConfig[caseItem.status as keyof typeof caseStatusConfig]?.icon || FileText
                return (
                  <Card key={caseItem.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base line-clamp-2">{caseItem.title}</CardTitle>
                        <Badge 
                          className={cn(
                            'shrink-0',
                            caseStatusConfig[caseItem.status as keyof typeof caseStatusConfig]?.color
                          )}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {getCaseStatusLabel(caseItem.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {caseItem.categoryRel && (
                          <>
                            <Tag className="h-3 w-3" />
                            <span>{caseItem.categoryRel.name}</span>
                          </>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {caseItem.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {caseItem.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(caseItem.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-sky-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950"
                            onClick={() => handleViewCase(caseItem)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditCase(caseItem)}
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:text-rose-600"
                            onClick={() => {
                              setDeleteTarget({ type: 'case', id: caseItem.id })
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
          {casesTotalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Trang {casesPage}/{casesTotalPages} ({casesTotal} kết quả)
              </span>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={(e) => { e.preventDefault(); if (casesPage > 1) fetchCases(casesPage - 1) }}
                      className={cn(casesPage <= 1 && 'pointer-events-none opacity-50', 'cursor-pointer')}
                    />
                  </PaginationItem>
                  {Array.from({ length: casesTotalPages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === casesPage}
                        onClick={(e) => { e.preventDefault(); fetchCases(p) }}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={(e) => { e.preventDefault(); if (casesPage < casesTotalPages) fetchCases(casesPage + 1) }}
                      className={cn(casesPage >= casesTotalPages && 'pointer-events-none opacity-50', 'cursor-pointer')}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </TabsContent>

        {/* Worklogs Tab */}
        <TabsContent value="worklogs" className="mt-0">
          {/* Statistics Dashboard */}
          {worklogStats && !loading && (
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <BarChart3 className="h-5 w-5 text-primary" />
                Thống kê Worklogs
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-1" />
                    <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {worklogStats.byWorkStatus.find(s => s.workStatus === 'completed')?._count || 0}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">Hoàn thành</span>
                  </CardContent>
                </Card>
                <Card className="bg-sky-50/50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/50">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Clock className="h-6 w-6 text-sky-500 mb-1" />
                    <span className="text-2xl font-bold text-sky-700 dark:text-sky-300">
                      {worklogStats.byWorkStatus.find(s => s.workStatus === 'in_progress')?._count || 0}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">Đang xử lý</span>
                  </CardContent>
                </Card>
                <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <AlertCircle className="h-6 w-6 text-amber-500 mb-1" />
                    <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                      {worklogStats.byWorkStatus.find(s => s.workStatus === 'pending')?._count || 0}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">Chờ xử lý</span>
                  </CardContent>
                </Card>
                <Card className="bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <XCircle className="h-6 w-6 text-rose-500 mb-1" />
                    <span className="text-2xl font-bold text-rose-700 dark:text-rose-300">
                      {worklogStats.byWorkStatus.find(s => s.workStatus === 'failed')?._count || 0}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">Thất bại</span>
                  </CardContent>
                </Card>
              </div>

              {/* Detail Stats Grid */}
              <div className="grid gap-4 sm:grid-cols-3">
                {/* By Category */}
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      Theo danh mục
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-2">
                    {worklogStats.byCategory.slice(0, 5).map((item) => {
                      const pct = worklogStats.total > 0 ? Math.round((item._count / worklogStats.total) * 100) : 0
                      return (
                        <div key={item.category} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{getCategoryName(item.category!)}</span>
                            <span className="font-medium">{item._count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary/70 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                    {worklogStats.byCategory.length === 0 && (
                      <p className="text-xs text-muted-foreground">Chưa có dữ liệu</p>
                    )}
                  </CardContent>
                </Card>

                {/* By Priority */}
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      Theo độ ưu tiên
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-2">
                    {worklogStats.byPriority.map((item) => {
                      const pct = worklogStats.total > 0 ? Math.round((item._count / worklogStats.total) * 100) : 0
                      return (
                        <div key={item.priority} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{getPriorityLabel(item.priority)}</span>
                            <span className="font-medium">{item._count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={cn(
                              'h-full rounded-full transition-all',
                              item.priority === 'Critical' ? 'bg-rose-500' :
                              item.priority === 'High' ? 'bg-amber-500' :
                              item.priority === 'Medium' ? 'bg-sky-500' : 'bg-slate-400'
                            )} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* By Month */}
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      Theo tháng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-2">
                    {worklogStats.byMonth.map((item) => {
                      const maxCount = Math.max(...worklogStats.byMonth.map(m => m.count), 1)
                      const pct = Math.round((item.count / maxCount) * 100)
                      return (
                        <div key={item.month} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{item.month}</span>
                            <span className="font-medium">{item.count}</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary/70 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                    {worklogStats.byMonth.length === 0 && (
                      <p className="text-xs text-muted-foreground">Chưa có dữ liệu</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : worklogs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Không có worklog nào</p>
                <Button variant="outline" className="mt-4" onClick={handleCreateWorklog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo worklog đầu tiên
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {worklogs.map((worklog) => {
                const StatusIcon = worklogStatusConfig[worklog.status as keyof typeof worklogStatusConfig]?.icon || Clock
                return (
                  <Card key={worklog.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base line-clamp-2">{worklog.title}</CardTitle>
                        <div className="flex gap-1 shrink-0">
                          <Badge 
                            className={cn(
                              priorityConfig[worklog.priority as keyof typeof priorityConfig]?.color
                            )}
                          >
                            {getPriorityLabel(worklog.priority)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        {worklog.category && (
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {getCategoryName(worklog.category)}
                          </span>
                        )}
                        {worklog.clientName && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {worklog.clientName}
                          </span>
                        )}
                        {worklog.timeSpent && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {worklog.timeSpent}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {worklog.issueDescription && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {worklog.issueDescription}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={cn(
                              'text-xs',
                              workStatusConfig[worklog.workStatus as keyof typeof workStatusConfig]?.color
                            )}
                          >
                            {getWorkStatusLabel(worklog.workStatus)}
                          </Badge>
                          {worklog.date && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(worklog.date)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditWorklog(worklog)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:text-rose-600"
                            onClick={() => {
                              setDeleteTarget({ type: 'worklog', id: worklog.id })
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
          {worklogsTotalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Trang {worklogsPage}/{worklogsTotalPages} ({worklogsTotal} kết quả)
              </span>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={(e) => { e.preventDefault(); if (worklogsPage > 1) fetchWorklogs(worklogsPage - 1) }}
                      className={cn(worklogsPage <= 1 && 'pointer-events-none opacity-50', 'cursor-pointer')}
                    />
                  </PaginationItem>
                  {Array.from({ length: worklogsTotalPages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === worklogsPage}
                        onClick={(e) => { e.preventDefault(); fetchWorklogs(p) }}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={(e) => { e.preventDefault(); if (worklogsPage < worklogsTotalPages) fetchWorklogs(worklogsPage + 1) }}
                      className={cn(worklogsPage >= worklogsTotalPages && 'pointer-events-none opacity-50', 'cursor-pointer')}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Case Dialog */}
      <Dialog open={caseDialogOpen} onOpenChange={setCaseDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingCase ? 'Sửa Case' : 'Tạo Case Mới'}</DialogTitle>
            <DialogDescription>
              {editingCase ? 'Cập nhật thông tin case' : 'Điền thông tin để tạo case mới'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="title">Tiêu đề *</Label>
                  <Input
                    id="title"
                    value={caseForm.title}
                    onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
                    placeholder="Nhập tiêu đề case"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục</Label>
                  <Select 
                    value={caseForm.category} 
                    onValueChange={(value) => setCaseForm({ ...caseForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.code} value={cat.code}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select 
                    value={caseForm.status} 
                    onValueChange={(value) => setCaseForm({ ...caseForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Hoạt động</SelectItem>
                      <SelectItem value="Draft">Nháp</SelectItem>
                      <SelectItem value="Archived">Lưu trữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={caseForm.description}
                  onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
                  placeholder="Mô tả chi tiết vấn đề"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symptoms">Triệu chứng</Label>
                <Textarea
                  id="symptoms"
                  value={caseForm.symptoms}
                  onChange={(e) => setCaseForm({ ...caseForm, symptoms: e.target.value })}
                  placeholder="Các dấu hiệu/triệu chứng nhận biết"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rootCause">Nguyên nhân gốc rễ</Label>
                <Textarea
                  id="rootCause"
                  value={caseForm.rootCause}
                  onChange={(e) => setCaseForm({ ...caseForm, rootCause: e.target.value })}
                  placeholder="Nguyên nhân gốc rễ của vấn đề"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="solution">Giải pháp</Label>
                <Textarea
                  id="solution"
                  value={caseForm.solution}
                  onChange={(e) => setCaseForm({ ...caseForm, solution: e.target.value })}
                  placeholder="Giải pháp xử lý"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prevention">Phòng ngừa</Label>
                <Textarea
                  id="prevention"
                  value={caseForm.prevention}
                  onChange={(e) => setCaseForm({ ...caseForm, prevention: e.target.value })}
                  placeholder="Các biện pháp phòng ngừa"
                  rows={2}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCaseDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveCase} disabled={saving || !caseForm.title.trim()}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingCase ? 'Cập nhật' : 'Tạo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Case Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-full w-full h-full inset-0 translate-x-0 translate-y-0 top-0 left-0 rounded-none overflow-hidden flex flex-col p-0 gap-0 shadow-2xl sm:rounded-lg sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-w-[96vw] sm:h-[94vh]" showCloseButton={false}>
          <DialogHeader className="p-6 pb-4 border-b bg-muted/20">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <DialogTitle className="text-xl leading-tight">
                  {selectedCase?.title}
                </DialogTitle>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Badge 
                    className={cn(
                      'font-medium',
                      selectedCase?.status ? caseStatusConfig[selectedCase.status as keyof typeof caseStatusConfig]?.color : ''
                    )}
                  >
                    {selectedCase?.status && getCaseStatusLabel(selectedCase.status)}
                  </Badge>
                  {selectedCase?.categoryRel && (
                    <span className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      {selectedCase.categoryRel.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {selectedCase?.createdAt && formatDate(selectedCase.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-9"
                  onClick={() => {
                    if (selectedCase) {
                      setDetailDialogOpen(false)
                      handleEditCase(selectedCase)
                    }
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Chỉnh sửa
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => setDetailDialogOpen(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 w-full overflow-y-auto bg-background custom-scrollbar">
            <div className="p-10 space-y-12 w-full">
              {/* Description */}
              {selectedCase?.description && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <FileText className="h-4 w-4" />
                    </div>
                    Mô tả tổng quan
                  </div>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedCase.description}
                  </div>
                </div>
              )}

              {/* Symptoms */}
              {selectedCase?.symptoms && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-500 font-semibold">
                    <div className="p-1.5 rounded-md bg-amber-500/10">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    Triệu chứng & Dấu hiệu
                  </div>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedCase.symptoms}
                  </div>
                </div>
              )}

              <Separator />

              {/* Root Cause */}
              {selectedCase?.rootCause && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-rose-500 font-semibold">
                    <div className="p-1.5 rounded-md bg-rose-500/10">
                      <Info className="h-4 w-4" />
                    </div>
                    Nguyên nhân gốc rễ
                  </div>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedCase.rootCause}
                  </div>
                </div>
              )}

              {/* Solution */}
              {selectedCase?.solution && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                      <div className="p-1.5 rounded-md bg-emerald-500/10">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      Giải pháp xử lý
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950 transition-all"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedCase.solution!)
                        toast.success('Đã sao chép giải pháp')
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          Đã sao chép
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy giải pháp
                        </>
                      )}
                    </Button>
                  </div>
                  <Card className="border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                    <CardContent className="p-4 text-emerald-900 dark:text-emerald-100 leading-relaxed whitespace-pre-wrap">
                      {selectedCase.solution}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Prevention */}
              {selectedCase?.prevention && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sky-500 font-semibold">
                    <div className="p-1.5 rounded-md bg-sky-500/10">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    Biện pháp phòng ngừa
                  </div>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedCase.prevention}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-muted/10">
            <Button variant="secondary" onClick={() => setDetailDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Worklog Dialog */}
      <Dialog open={worklogDialogOpen} onOpenChange={setWorklogDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingWorklog ? 'Sửa Worklog' : 'Tạo Worklog Mới'}</DialogTitle>
            <DialogDescription>
              {editingWorklog ? 'Cập nhật thông tin worklog' : 'Điền thông tin để tạo worklog mới'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="wl-title">Tiêu đề *</Label>
                  <Input
                    id="wl-title"
                    value={worklogForm.title}
                    onChange={(e) => setWorklogForm({ ...worklogForm, title: e.target.value })}
                    placeholder="Nhập tiêu đề worklog"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wl-category">Danh mục</Label>
                  <Select 
                    value={worklogForm.category} 
                    onValueChange={(value) => setWorklogForm({ ...worklogForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.code} value={cat.code}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wl-client">Khách hàng</Label>
                  <Input
                    id="wl-client"
                    value={worklogForm.clientName}
                    onChange={(e) => setWorklogForm({ ...worklogForm, clientName: e.target.value })}
                    placeholder="Tên khách hàng"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wl-priority">Độ ưu tiên</Label>
                  <Select 
                    value={worklogForm.priority} 
                    onValueChange={(value) => setWorklogForm({ ...worklogForm, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Thấp</SelectItem>
                      <SelectItem value="Medium">Trung bình</SelectItem>
                      <SelectItem value="High">Cao</SelectItem>
                      <SelectItem value="Critical">Khẩn cấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wl-status">Trạng thái công việc</Label>
                  <Select 
                    value={worklogForm.workStatus} 
                    onValueChange={(value) => setWorklogForm({ ...worklogForm, workStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="in_progress">Đang xử lý</SelectItem>
                      <SelectItem value="pending">Chờ xử lý</SelectItem>
                      <SelectItem value="failed">Thất bại</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wl-time">Thời gian xử lý</Label>
                  <Input
                    id="wl-time"
                    value={worklogForm.timeSpent}
                    onChange={(e) => setWorklogForm({ ...worklogForm, timeSpent: e.target.value })}
                    placeholder="VD: 2h 30m"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wl-date">Ngày</Label>
                  <Input
                    id="wl-date"
                    type="date"
                    value={worklogForm.date}
                    onChange={(e) => setWorklogForm({ ...worklogForm, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wl-result">Kết quả</Label>
                  <Select 
                    value={worklogForm.result} 
                    onValueChange={(value) => setWorklogForm({ ...worklogForm, result: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Resolved">Đã giải quyết</SelectItem>
                      <SelectItem value="Partially Resolved">Giải quyết một phần</SelectItem>
                      <SelectItem value="Escalated">Đã chuyển lên</SelectItem>
                      <SelectItem value="Pending">Chờ xử lý</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wl-issue">Mô tả vấn đề</Label>
                <Textarea
                  id="wl-issue"
                  value={worklogForm.issueDescription}
                  onChange={(e) => setWorklogForm({ ...worklogForm, issueDescription: e.target.value })}
                  placeholder="Mô tả chi tiết vấn đề gặp phải"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wl-solution">Giải pháp áp dụng</Label>
                <Textarea
                  id="wl-solution"
                  value={worklogForm.solutionApplied}
                  onChange={(e) => setWorklogForm({ ...worklogForm, solutionApplied: e.target.value })}
                  placeholder="Giải pháp đã áp dụng"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wl-description">Ghi chú thêm</Label>
                <Textarea
                  id="wl-description"
                  value={worklogForm.description}
                  onChange={(e) => setWorklogForm({ ...worklogForm, description: e.target.value })}
                  placeholder="Ghi chú thêm (nếu có)"
                  rows={2}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWorklogDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveWorklog} disabled={saving || !worklogForm.title.trim()}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingWorklog ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {deleteTarget?.type === 'case' ? 'case' : 'worklog'} này? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={saving}
              className="bg-rose-500 hover:bg-rose-600"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
