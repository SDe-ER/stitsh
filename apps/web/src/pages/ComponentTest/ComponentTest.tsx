import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  Button,
  Badge,
  DataTable,
  Modal,
  FormInput,
  FormSelect,
  FormTextarea,
  AlertBanner,
  StatusBadge,
  LoadingSpinner,
  PageLoader,
  FileUpload,
  ImageCropModal,
} from '@/components/ui'
import { Plus, Download, Trash2, Edit, Search, User, Mail, Phone } from 'lucide-react'

// Sample data for DataTable
interface Employee {
  id: number
  name: string
  nameAr: string
  position: string
  positionAr: string
  department: string
  departmentAr: string
  status: 'active' | 'inactive' | 'on-leave'
}

const sampleEmployees: Employee[] = [
  { id: 1, name: 'Ahmed Al-Rashid', nameAr: 'أحمد الرشيد', position: 'Project Manager', positionAr: 'مدير مشاريع', department: 'Operations', departmentAr: 'العمليات', status: 'active' },
  { id: 2, name: 'Fatima Hassan', nameAr: 'فاطمة حسن', position: 'Engineer', positionAr: 'مهندس', department: 'Technical', departmentAr: 'الفني', status: 'active' },
  { id: 3, name: 'Omar Khalil', nameAr: 'عمر خليل', position: 'Supervisor', positionAr: 'مشرف', department: 'Operations', departmentAr: 'العمليات', status: 'on-leave' },
  { id: 4, name: 'Layla Mahmood', nameAr: 'ليلى محمود', position: 'Accountant', positionAr: 'محاسب', department: 'Finance', departmentAr: 'المالية', status: 'active' },
  { id: 5, name: 'Kareem Said', nameAr: 'كريم سعيد', position: 'Technician', positionAr: 'فني', department: 'Maintenance', departmentAr: 'الصيانة', status: 'inactive' },
]

const columns = [
  { key: 'nameAr', title: 'Employee Name', titleAr: 'اسم الموظف', sortable: true },
  { key: 'positionAr', title: 'Position', titleAr: 'المسمى الوظيفي', sortable: true },
  { key: 'departmentAr', title: 'Department', titleAr: 'القسم', sortable: true },
  {
    key: 'status',
    title: 'Status',
    titleAr: 'الحالة',
    render: (status: string) => <StatusBadge status={status} size="sm" />,
  },
]

export function ComponentTest() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showPageLoader, setShowPageLoader] = useState(false)
  const [buttonLoading, setButtonLoading] = useState(false)
  const [alertType, setAlertType] = useState<'info' | 'success' | 'warning' | 'error'>('info')
  const [showAlert, setShowAlert] = useState(true)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [testImage, setTestImage] = useState<string | null>(null)
  const [testPhotoUrl, setTestPhotoUrl] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    message: '',
  })

  const handleLoadingDemo = () => {
    setButtonLoading(true)
    setTimeout(() => setButtonLoading(false), 2000)
  }

  const handlePageLoaderDemo = () => {
    setShowPageLoader(true)
    setTimeout(() => setShowPageLoader(false), 2000)
  }

  const breadcrumbs = [
    { label: 'Home', labelAr: 'الرئيسية', path: '/' },
    { label: 'Component Test', labelAr: 'اختبار المكونات' },
  ]

  const headerActions = [
    {
      label: 'Add New',
      labelAr: 'إضافة جديد',
      icon: <Plus className="w-4 h-4" />,
      variant: 'primary' as const,
      onClick: () => setIsModalOpen(true),
    },
    {
      label: 'Export',
      labelAr: 'تصدير',
      icon: <Download className="w-4 h-4" />,
      variant: 'outline' as const,
      onClick: () => console.log('Export clicked'),
    },
  ]

  return (
    <AppLayout titleAr="اختبار المكونات">
      {showPageLoader && <PageLoader messageAr="جاري التحميل..." />}

      <PageHeader
        title="Component Library Test"
        titleAr="اختبار مكتبة المكونات"
        subtitle="Testing all UI components"
        subtitleAr="اختبار جميع مكونات الواجهة"
        actions={headerActions}
        breadcrumbs={breadcrumbs}
      />

      <div className="space-y-8">
        {/* Alert Banners */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 font-cairo mb-4">Alert Banners / التنبيهات</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {showAlert && (
              <AlertBanner
                type={alertType}
                message="This is an info alert message"
                messageAr="هذه رسالة تنبيه معلوماتي"
                onClose={() => setShowAlert(false)}
              />
            )}
            <AlertBanner
              type="success"
              message="Operation completed successfully"
              messageAr="تمت العملية بنجاح"
            />
            <AlertBanner
              type="warning"
              message="Please review this warning"
              messageAr="يرجى مراجعة هذا التحذير"
            />
            <AlertBanner
              type="error"
              message="An error has occurred"
              messageAr="حدث خطأ ما"
            />
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 font-cairo mb-4">Buttons / الأزرار</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              {/* Variants */}
              <div>
                <p className="text-sm text-gray-600 font-cairo mb-2">Variants / الأنواع:</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" onClick={handleLoadingDemo} loading={buttonLoading}>
                    زر أساسي
                  </Button>
                  <Button variant="secondary">ثانوي</Button>
                  <Button variant="success">نجاح</Button>
                  <Button variant="danger">خطر</Button>
                  <Button variant="ghost">شبح</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <p className="text-sm text-gray-600 font-cairo mb-2">Sizes / الأحجام:</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" size="sm">صغير</Button>
                  <Button variant="primary" size="md">متوسط</Button>
                  <Button variant="primary" size="lg">كبير</Button>
                </div>
              </div>

              {/* With Icons */}
              <div>
                <p className="text-sm text-gray-600 font-cairo mb-2">With Icons / مع الأيقونات:</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" icon={<Plus className="w-4 h-4" />} iconPosition="right">
                    إضافة
                  </Button>
                  <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} iconPosition="right">
                    حذف
                  </Button>
                  <Button variant="outline" icon={<Edit className="w-4 h-4" />} iconPosition="right">
                    تعديل
                  </Button>
                  <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
                    تصدير
                  </Button>
                </div>
              </div>

              {/* Full Width */}
              <div>
                <p className="text-sm text-gray-600 font-cairo mb-2">Full Width / عرض كامل:</p>
                <Button variant="primary" fullWidth onClick={handlePageLoaderDemo}>
                  اختبار Page Loader
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 font-cairo mb-4">Badges / الشارات</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              {/* Variants */}
              <div>
                <p className="text-sm text-gray-600 font-cairo mb-2">Variants / الأنواع:</p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="blue">أزرق</Badge>
                  <Badge variant="green">أخضر</Badge>
                  <Badge variant="amber">أصفر</Badge>
                  <Badge variant="red">أحمر</Badge>
                  <Badge variant="slate">رمادي</Badge>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <p className="text-sm text-gray-600 font-cairo mb-2">Sizes / الأحجام:</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="blue" size="sm">صغير</Badge>
                  <Badge variant="blue" size="md">متوسط</Badge>
                </div>
              </div>

              {/* With Dots */}
              <div>
                <p className="text-sm text-gray-600 font-cairo mb-2">With Dots / مع النقاط:</p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="blue" dot>جديد</Badge>
                  <Badge variant="green" dot>نشط</Badge>
                  <Badge variant="amber" dot>تحذير</Badge>
                  <Badge variant="red" dot>خطر</Badge>
                </div>
              </div>

              {/* Status Badges */}
              <div>
                <p className="text-sm text-gray-600 font-cairo mb-2">Status Badges / شارات الحالة:</p>
                <div className="flex flex-wrap gap-3">
                  <StatusBadge status="active" />
                  <StatusBadge status="inactive" />
                  <StatusBadge status="pending" />
                  <StatusBadge status="completed" />
                  <StatusBadge status="delayed" />
                  <StatusBadge status="maintenance" />
                  <StatusBadge status="error" />
                  <StatusBadge status="warning" />
                </div>
              </div>

              {/* With Numbers */}
              <div>
                <p className="text-sm text-gray-600 font-cairo mb-2">With Numbers / مع الأرقام:</p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="red">5</Badge>
                  <Badge variant="blue">12</Badge>
                  <Badge variant="green">99+</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Loading Spinners */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 font-cairo mb-4">Loading Spinners / دوائر التحميل</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-cairo mb-2">Sizes / الأحجام:</p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm font-cairo">صغير</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="md" />
                    <span className="text-sm font-cairo">متوسط</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="lg" />
                    <span className="text-sm font-cairo">كبير</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-cairo mb-2">Colors / الألوان:</p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <LoadingSpinner color="primary" />
                    <span className="text-sm font-cairo">أساسي</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LoadingSpinner color="secondary" />
                    <span className="text-sm font-cairo">ثانوي</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LoadingSpinner color="accent" />
                    <span className="text-sm font-cairo">إبراز</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded">
                    <LoadingSpinner color="white" />
                    <span className="text-sm font-cairo text-white">أبيض</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form Inputs */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 font-cairo mb-4">Form Inputs / حقول الإدخال</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FormInput
                label="Full Name"
                labelAr="الاسم الكامل"
                placeholder="أدخل اسمك الكامل"
                placeholderAr="أدخل اسمك الكامل"
                required
                leftIcon={<User className="w-5 h-5 text-gray-400" />}
              />

              <FormInput
                label="Email Address"
                labelAr="البريد الإلكتروني"
                type="email"
                placeholder="example@email.com"
                leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
              />

              <FormInput
                label="Phone Number"
                labelAr="رقم الهاتف"
                type="tel"
                placeholder="+966 5X XXX XXXX"
                leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
                helperText="Include country code"
                helperTextAr="يشمل رمز الدولة"
              />

              <FormInput
                label="Disabled Input"
                labelAr="حقل معطل"
                defaultValue="غير قابل للتعديل"
                disabled
              />

              <FormInput
                label="With Error"
                labelAr="بحالة خطأ"
                error="This field is required"
                errorAr="هذا الحقل مطلوب"
              />

              <FormSelect
                label="Department"
                labelAr="القسم"
                options={[
                  { value: 'ops', label: 'Operations', labelAr: 'العمليات' },
                  { value: 'tech', label: 'Technical', labelAr: 'الفني' },
                  { value: 'finance', label: 'Finance', labelAr: 'المالية' },
                  { value: 'hr', label: 'HR', labelAr: 'الموارد البشرية' },
                ]}
                placeholder="Select department"
                placeholderAr="اختر القسم"
              />

              <FormTextarea
                label="Message"
                labelAr="الرسالة"
                placeholder="Enter your message..."
                placeholderAr="أدخل رسالتك..."
                rows={4}
                showCharCount
                maxLength={200}
              />
            </div>
          </div>
        </section>

        {/* Image Cropper */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 font-cairo mb-4">Image Cropper / قص الصور</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-6">
              {/* Profile Photo Test */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 font-cairo mb-3">Profile Photo (4×6 cm Portrait)</h3>
                <FileUpload
                  labelAr="صورة شخصية"
                  value={testPhotoUrl}
                  onChange={setTestPhotoUrl}
                  accept="image/*"
                  fileType="image"
                  maxSize={5}
                  imageType="photo"
                />
                {testPhotoUrl && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-cairo">
                      ✓ تم رفع الصورة بنجاح - الناتج: 240×360 بكسل (4×6 سم)
                    </p>
                  </div>
                )}
              </div>

              {/* ID Card Test */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 font-cairo mb-3">ID Card (85.6×53.98 mm International Standard)</h3>
                <FileUpload
                  labelAr="صورة البطاقة"
                  value=""
                  onChange={() => {}}
                  accept="image/*"
                  fileType="image"
                  maxSize={5}
                  imageType="idCard"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Data Table */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 font-cairo mb-4">Data Table / جدول البيانات</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <DataTable
              columns={columns}
              data={sampleEmployees}
              searchable
              searchPlaceholderAr="بحث بالاسم، المسمى، أو القسم..."
              pageSize={5}
              onRowClick={(row) => console.log('Clicked:', row)}
              idKey="id"
            />
          </div>
        </section>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Employee"
        titleAr="إضافة موظف جديد"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              حفظ
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Employee Name"
            labelAr="اسم الموظف"
            placeholder="Enter employee name"
            placeholderAr="أدخل اسم الموظف"
            required
          />

          <FormSelect
            label="Department"
            labelAr="القسم"
            options={[
              { value: 'ops', label: 'Operations', labelAr: 'العمليات' },
              { value: 'tech', label: 'Technical', labelAr: 'الفني' },
              { value: 'finance', label: 'Finance', labelAr: 'المالية' },
            ]}
            placeholder="Select department"
            placeholderAr="اختر القسم"
          />

          <FormTextarea
            label="Notes"
            labelAr="ملاحظات"
            placeholder="Additional notes..."
            placeholderAr="ملاحظات إضافية..."
            rows={3}
          />
        </div>
      </Modal>

      {/* Image Crop Modal */}
      {testImage && (
        <ImageCropModal
          isOpen={cropModalOpen}
          onClose={() => {
            setCropModalOpen(false)
            setTestImage(null)
          }}
          imageSrc={testImage}
          onCropComplete={(blob) => {
            const url = URL.createObjectURL(blob)
            setTestPhotoUrl(url)
            setTestImage(null)
          }}
          imageType="photo"
        />
      )}
    </AppLayout>
  )
}
