import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Data from the original PostgreSQL database

const users = [
  { id: 1, username: 'admin', email: 'admin@local', passwordHash: '$2b$10$bFC99bGxTPPER2k4ZjTSI.RlzHt2JF6GQtojMa9Yx0OtYJ3mYocSm', fullName: 'System Administrator', role: 'admin', isActive: true },
  { id: 2, username: 'chanhpm', email: 'chanhpm@nguyenkimvn.vn', passwordHash: '$2b$10$PS6.OWax1CXbzFLJeD25beYKbGT9275XdBbs/Wu8uObLog683PI6i', fullName: 'Phan Minh Chánh', role: 'admin', isActive: true },
]

const categories = [
  { code: 'database', name: 'Cơ sở dữ liệu', icon: '🗄️', description: 'Cơ sở dữ liệu, MySQL, SQL Server, MongoDB', color: '#6f42c1' },
  { code: 'application', name: 'Ứng dụng', icon: '📱', description: 'Ứng dụng, web apps, mobile apps, APIs', color: '#fd7e14' },
  { code: 'user-support', name: 'Hỗ trợ người dùng', icon: '👤', description: 'Hỗ trợ người dùng, password, access, training', color: '#20c997' },
  { code: 'hardware', name: 'Phần cứng', icon: '🔧', description: 'Phần cứng, servers, printers, network devices', color: '#e83e8c' },
  { code: 'other', name: 'Khác', icon: '📋', description: 'Các vấn đề khác', color: '#6c757d' },
  { code: 'network', name: 'Mạng', icon: '🌐', description: 'Các vấn đề về mạng, kết nối, routing, DNS', color: '#007bff' },
  { code: 'server', name: 'Máy chủ', icon: '🖥️', description: 'Máy chủ, hệ thống', color: '#28a745' },
  { code: 'printer', name: 'Máy in', icon: '🖨️', description: 'Các vấn đề và giải pháp liên quan đến máy in', color: '#17a2b8' },
  { code: 'storage', name: 'Lưu trữ', icon: '💾', description: 'Lưu trữ dữ liệu, NAS, SAN, cloud storage, backup', color: '#ffc107' },
  { code: 'virtualization', name: 'Ảo hóa', icon: '☁️', description: 'Máy ảo, VMware, Hyper-V, containers, Docker, Kubernetes', color: '#dc3545' },
  { code: 'system', name: 'Hệ thống', icon: '💻', description: 'Hệ điều hành, Windows, Linux, services', color: '#28a745' },
  { code: 'security', name: 'Bảo mật', icon: '🔒', description: 'Bảo mật, firewall, antivirus, encryption', color: '#dc3545' },
]

const cases = [
  {
    id: 1,
    title: 'Tăng giới hạn dung lượng file Outlook (.pst/.ost) qua Registry',
    category: 'application',
    description: 'Mặc định Outlook giới hạn file data ở mức 50GB. Khi file đạt ngưỡng này, user không thể nhận/gửi mail mới hoặc mở Outlook bị lỗi',
    symptoms: 'Outlook báo lỗi "The file is too large", "Outlook data file has reached the maximum size", không thể nhận email mới dù đã xóa bớt mail',
    rootCause: 'Giới hạn mặc định (Default Limit) của Unicode PST/OST trong Outlook 2010/2013/2016/2019/365 là 50GB',
    solution: '1. Mở Registry Editor (Windows + R > regedit).\n\n2. Truy cập đường dẫn (tùy phiên bản Office):\nOutlook 2016/2019/365: HKEY_CURRENT_USER\\Software\\Microsoft\\Office\\16.0\\Outlook\\PST\n(Nếu chưa có key PST thì chuột phải vào Outlook > New > Key > đặt tên PST)\n\n3. Tạo 2 DWORD (32-bit) Value mới:\n- Tên: MaxLargeFileSize -> Chọn Decimal -> Nhập dung lượng tối đa (VD: 102400 = 100GB).\n- Tên: WarnLargeFileSize -> Chọn Decimal -> Nhập mức cảnh báo (VD: 97280 = 95GB).\n\n4. Khởi động lại Outlook.',
    prevention: 'Nên dùng tính năng Online Archive (nếu dùng Microsoft 365) thay vì tăng file local quá lớn dễ gây corrupt file, Compact file PST định kỳ',
    status: 'Active',
  },
  {
    id: 2,
    title: 'Hướng dẫn Reset Toner (Mực) máy in Brother MFC-L2701DW',
    category: 'printer',
    description: 'Máy in báo "Replace Toner" hoặc "Toner Low" và không cho in, dù mới nạp mực hoặc thay hộp mực mới',
    symptoms: 'Màn hình LCD báo "Replace Toner", "Toner Ended", đèn Toner nhấp nháy',
    rootCause: 'Hộp mực (Cartridge) không có nhông reset (hộp đi theo máy) hoặc nhông chưa được xoay về vị trí reset',
    solution: 'Áp dụng cho: Brother MFC-L2701DW, MFC-L2701D (Cách Soft Reset không cần đụng nhông)\n\n1. Bật nguồn máy in.\n\n2. Mở nắp trước (Front Cover) -> Màn hình báo "Cover is Open".\n\n3. Nhấn và Giữ nút "OK" khoảng 2 giây -> Màn hình hiện "Replace Drum?".\n\n4. LƯU Ý QUAN TRỌNG: KHÔNG nhấn phím 1. Thay vào đó, bấm mã: * 0 0 (Phím Sao - Số 0 - Số 0).\n\n5. Màn hình sẽ hiển thị "Accepted" (hoặc trở về menu). Đóng nắp trước lại.\n\n6. Máy sẽ khởi động và hết báo lỗi Toner.',
    prevention: 'Nên mua hộp mực thương hiệu có sẵn nhông reset để tự động reset khi xoay nhông, cách trên chỉ dùng "chữa cháy" hoặc dùng cho hộp mực starter',
    status: 'Active',
  },
  {
    id: 3,
    title: 'Hướng dẫn Reset Drum máy in Brother (Dòng MFC/DCP/HL)',
    category: 'printer',
    description: 'Máy in báo lỗi "Replace Drum", "Drum End Soon" dù vẫn in được hoặc vừa thay cụm drum mới nhưng vẫn báo lỗi',
    symptoms: 'Đèn Drum sáng (với dòng HL) hoặc màn hình hiện thông báo "Replace Drum" (với dòng MFC/DCP), máy ngưng in',
    rootCause: 'Bộ đếm (Counter) của cụm Drum đã đạt giới hạn (thường là 12.000 trang), cần reset thủ công để đếm lại từ đầu',
    solution: 'Áp dụng cho: Brother MFC-L2701DW, MFC-L2701D, DCP-L2520D, HL-L2321D, HL-L2361DN, HL-L2366DW\n\n1. Đối với dòng có màn hình (MFC-L2701DW, L2701D, DCP-L2520D...):\n- Bật nguồn, mở nắp trước (Front Cover).\n- Nhấn và giữ nút "OK" khoảng 2 giây.\n- Màn hình hiện "Replace Drum?" -> Nhấn phím "1" (hoặc phím Mũi tên lên) để chọn Yes.\n- Màn hình báo "Accepted". Đóng nắp lại.\n\n2. Đối với dòng KHÔNG màn hình (HL-L2321D, HL-L2361DN...):\n- Bật nguồn, mở nắp trước.\n- Nhấn và giữ nút "Go" khoảng 4 giây cho đến khi tất cả đèn đều sáng.\n- Thả nút "Go". Đóng nắp lại.',
    prevention: 'Chỉ reset khi thay drum mới hoặc khi drum cũ vẫn còn tốt nhưng bị khóa counter. Không reset khi drum đã quá mòn (bản in bị sọc đen)',
    status: 'Active',
  },
  {
    id: 4,
    title: 'Mạng Chính Nhân và Nguyên Kim không thông nhau',
    category: 'network',
    description: 'Mạng Chính Nhân và Nguyên Kim không thông nhau',
    symptoms: 'User đang ở lớp mạng CN không kết nối được tới tài nguyên của lớp mạng NK và ngược lại',
    rootCause: 'Treo router Vigor',
    solution: 'Reboot lại router Nguyên Kim',
    prevention: 'Thiết lập lịch auto reboot vào mỗi sáng trước giờ làm trên cả 2 router (NK và CN)',
    status: 'Active',
  },
  {
    id: 5,
    title: 'Mở rộng dung lượng máy ảo trên VMware (Expand VM Disk)',
    category: 'virtualization',
    description: 'Tăng dung lượng ổ cứng cho máy ảo VMware (Windows/Linux) khi bị đầy',
    symptoms: 'Máy ảo báo Low Disk Space, cần mở rộng nóng (Hot Expand) hoặc mở rộng nguội',
    rootCause: 'Dung lượng ổ cứng ảo (VMDK) đã hết, cần tăng size từ phía Hypervisor',
    solution: '1. Kiểm tra Snapshot (BẮT BUỘC): Vào VM > Snapshots > Manage Snapshots > Delete All (Phải xóa hết snapshot mới được Expand).\n\n2. Tăng dung lượng (vSphere/ESXi): Chuột phải VM > Edit Settings > Hard Disk > Nhập dung lượng mới (lớn hơn cũ) > Save.\n\n3. Vào Guest OS (Windows): Disk Management > Rescan Disks > Chuột phải ổ C > Extend Volume.\n\n4. Vào Guest OS (Linux): Dùng lệnh fdisk/parted để resize partition và lvextend/xfs_growfs để resize file system.',
    prevention: 'Luôn xóa Snapshot trước khi thao tác đĩa, backup VM trước khi thực hiện resize partition trên Linux',
    status: 'Active',
  },
  {
    id: 6,
    title: 'Tăng dung lượng ổ cứng máy ảo Hyper-V (Expand VHDX)',
    category: 'virtualization',
    description: 'Hướng dẫn quy trình tăng dung lượng ổ đĩa',
    status: 'Active',
  },
  {
    id: 6,
    title: 'Hướng dẫn kết nối iSCSI Target trên Windows (iSCSI Initiator)',
    category: 'storage',
    description: 'Map ổ cứng mạng từ SAN/NAS về Windows Server/10/11 qua giao thức iSCSI để dùng như ổ cứng Local',
    symptoms: 'Cần thêm dung lượng lưu trữ cho máy chủ Windows nhưng muốn quản lý tập trung tại SAN/NAS',
    rootCause: 'Cấu hình iSCSI Initiator trên Windows chưa được thiết lập kết nối tới Target',
    solution: '1. Mở iSCSI Initiator: Nhấn Start > gõ "iSCSI Initiator".\n\n2. Tab "Discovery": Nhấn "Discover Portal" > Nhập IP của thiết bị NAS/SAN (Target).\n\n3. Tab "Targets": Chọn Target vừa hiện ra (trạng thái Inactive) > Nhấn "Connect" > OK (trạng thái chuyển sang Connected).\n\n4. Vào Disk Management (diskmgmt.msc) > Thấy Disk mới (Offline/Unknown).\n\n5. Chuột phải Disk > Online > Initialize Disk (GPT/MBR) > New Simple Volume để format và gán ký tự ổ đĩa.',
    prevention: 'Đặt IP tĩnh cho cả 2 đầu (Windows và NAS), bật Jumbo Frame (MTU 9000) nếu switch hỗ trợ để tăng tốc độ truyền tải',
    status: 'Active',
  },
  {
    id: 7,
    title: 'Hướng dẫn kết nối iSCSI Storage cho VMware ESXi',
    category: 'virtualization',
    description: 'Mount iSCSI LUN từ SAN/NAS vào VMware ESXi để tạo Datastore chứa máy ảo',
    symptoms: 'ESXi host cần thêm Datastore, hoặc cần thiết lập Shared Storage cho Cluster HA/DRS',
    rootCause: 'Chưa cấu hình Software iSCSI Adapter hoặc chưa bind port VMkernel',
    solution: '1. Tạo VMkernel Network: Networking > VMkernel NICs > Add VMkernel NIC > Chọn Port Group > Gán IP tĩnh (dùng cho traffic storage).\n\n2. Cấu hình Adapter: Storage > Adapters > Software iSCSI > Enabled.\n\n3. Tại phần Dynamic Targets: Nhấn Add dynamic target > Nhập IP của SAN/NAS > Save config.\n\n4. Rescan Adapter: Nhấn nút Rescan để ESXi tìm thấy các LUN/Device.\n\n5. Tạo Datastore: Storage > Datastores > New datastore > VMFS > Chọn LUN vừa tìm thấy > Next > Finish.',
    prevention: 'Dùng đường mạng vật lý riêng biệt (VLAN riêng) cho iSCSI traffic để tránh nghẽn mạng LAN nội bộ',
    status: 'Active',
  },
  {
    id: 8,
    title: 'Xử lý Outlook chậm/treo do file PST đạt giới hạn 50GB (Tách data)',
    category: 'application',
    description: 'Hướng dẫn giảm tải cho file data Outlook khi đạt ngưỡng 50GB bằng cách tách dữ liệu cũ sang file Archive mới',
    symptoms: 'Outlook phản hồi rất chậm (Not responding), không nhận được email mới, thanh trạng thái luôn hiện "Updating..."',
    rootCause: 'File PST/OST mặc định giới hạn 50GB. Khi đầy, database bị phân mảnh và quá tải khả năng xử lý của Indexing',
    solution: '1. Kiểm tra dung lượng: File > Info > Mailbox Settings.\n\n2. Sử dụng công cụ Archive (Tách data): Vào File > Info > Tools > Clean Up Old Items.\n\n3. Chọn "Archive this folder and all subfolders". Chọn thư mục gốc (thường là địa chỉ email).\n\n4. Tại dòng "Archive items older than": Chọn mốc thời gian (ví dụ: các mail cũ hơn 1 năm trước).\n\n5. Nhấn OK. Outlook sẽ cắt các mail cũ sang một file "archive.pst" riêng biệt, giúp file chính nhẹ đi và hoạt động mượt mà trở lại.',
    prevention: 'Thiết lập AutoArchive chạy định kỳ mỗi 1-3 tháng, Phân loại mail vào các file PST lưu trữ theo năm',
    status: 'Active',
  },
  {
    id: 9,
    title: 'Tăng giới hạn dung lượng file đính kèm Outlook bằng Registry',
    category: 'application',
    description: 'Mặc định Outlook/Exchange giới hạn file đính kèm khoảng 20MB. Cần tăng giới hạn này để gửi file lớn nội bộ',
    symptoms: 'Khi đính kèm file lớn (VD: 30MB), Outlook báo lỗi "The file you are attaching is bigger than the server allows"',
    rootCause: 'Policy mặc định của Outlook chặn file đính kèm lớn để bảo vệ băng thông Mail Server',
    solution: '1. Mở Registry Editor (Windows + R > regedit).\n\n2. Truy cập đường dẫn: HKEY_CURRENT_USER\\Software\\Microsoft\\Office\\16.0\\Outlook\\Preferences.\n\n3. Chuột phải vùng trống > New > DWORD (32-bit) Value.\n\n4. Đặt tên: MaximumAttachmentSize\n\n5. Double click vào key vừa tạo > Chọn Decimal > Nhập dung lượng tính bằng KB (VD: Nhập 51200 cho 50MB, hoặc nhập 0 để không giới hạn).\n\n6. Khởi động lại Outlook.',
    prevention: 'Khuyến nghị dùng OneDrive/Google Drive link cho file quá lớn thay vì đính kèm trực tiếp gây nặng mail server',
    status: 'Active',
  },
  {
    id: 10,
    title: 'Sửa lỗi Outlook "Not Implemented" trong Registry',
    category: 'application',
    description: 'Người dùng nhấn nút Send/Receive hoặc các nút chức năng thì báo lỗi, không thực hiện được lệnh',
    symptoms: 'Popup thông báo lỗi "Not Implemented" xuất hiện khi thao tác gửi nhận mail hoặc mở calendar',
    rootCause: 'File cấu hình SRS bị lỗi hoặc Key Registry quản lý Add-in/View bị hỏng do update Windows/Office',
    solution: '1. Đóng hoàn toàn Outlook.\n\n2. Xóa file SRS (Cách nhẹ): Vào %appdata%\\Microsoft\\Outlook > Xóa file Outlook.srs (Outlook sẽ tự tạo lại).\n\n3. Sửa Registry (Cách mạnh): Mở Regedit > Truy cập HKEY_CURRENT_USER\\Software\\Microsoft\\Office\\x.0\\Outlook.\n\n4. Tìm key con có tên "Resiliency" (nơi lưu các add-in bị crash) -> Chuột phải Delete key này.\n\n5. Nếu vẫn bị, chạy lệnh Repair Office: Control Panel > Programs and Features > Chọn Office > Change > Quick Repair.',
    prevention: 'Cập nhật Office thường xuyên, tránh cài các Add-in không rõ nguồn gốc gây xung đột',
    status: 'Active',
  },
  {
    id: 11,
    title: 'Tăng dung lượng ổ cứng máy ảo Hyper-V (Expand VHDX)',
    category: 'virtualization',
    description: 'Hướng dẫn quy trình tăng dung lượng ổ đĩa ảo (VHDX) cho máy ảo Hyper-V an toàn, giảm thiểu downtime',
    symptoms: 'Máy ảo báo hết dung lượng (Low Disk Space), nút "Edit Disk" trong Hyper-V bị mờ, hoặc đã expand nhưng trong OS không nhận',
    rootCause: 'Do còn tồn tại Checkpoint (Snapshot) chưa xóa, ổ đĩa đang gắn vào IDE Controller (Gen 1) thay vì SCSI, hoặc chưa Rescan Disk trong Guest OS',
    solution: '1. Xử lý Checkpoint (Quan trọng nhất): Phải xóa/merge hết Checkpoint trước khi thao tác. Chuột phải checkpoint -> Delete Checkpoint -> Chờ merge xong.\n\n2. Tăng dung lượng (Host): Vào VM Settings -> Hard Drive -> Edit -> Expand -> Nhập size mới.\n\n3. Mở rộng Partition (Guest OS): Remote vào VM, mở Disk Management (diskmgmt.msc) -> Action -> Rescan Disks.\n\n4. Click chuột phải vào ổ C (hoặc ổ data) -> Extend Volume -> Next -> Finish.\n\n5. Xử lý Recovery Partition (nếu có): Nếu bị phân vùng Recovery chắn, dùng diskpart để xóa phân vùng này trước khi Extend.',
    prevention: 'Luôn dùng VHDX (không dùng VHD cũ), ưu tiên máy ảo Gen 2, đặt cảnh báo dung lượng Guest OS ở mức 80%',
    status: 'Active',
  },
  {
    id: 12,
    title: 'Mở rộng dung lượng iSCSI cho Hyper-V (Live Expand)',
    category: 'virtualization',
    description: 'Cần tăng dung lượng ổ cứng iSCSI đang chứa máy ảo Hyper-V đang chạy mà không được tắt máy (Zero Downtime)',
    symptoms: 'Cảnh báo dung lượng thấp (Low Disk Space) trên ổ đĩa Cluster Shared Volume (CSV) hoặc ổ Data, không thể tạo thêm Checkpoint',
    rootCause: 'Dữ liệu máy ảo tăng trưởng nhanh, quên xóa các Checkpoint/Snapshot cũ, hoặc quy hoạch dung lượng ban đầu thiếu',
    solution: '1. Trên thiết bị Storage (SAN/NAS): Thực hiện thao tác Expand LUN/Volume lên dung lượng mong muốn.\n\n2. Trên Hyper-V Host (hoặc Owner Node nếu dùng Cluster): Mở Disk Management (diskmgmt.msc).\n\n3. Chọn Action > Rescan Disks để nhận diện dung lượng mới.\n\n4. Kiểm tra ổ đĩa iSCSI sẽ xuất hiện vùng "Unallocated" ở cuối.\n\n5. Chuột phải vào phân vùng (Partition) đang chứa dữ liệu > Chọn "Extend Volume".\n\n6. Chọn Next > Lấy hết dung lượng Unallocated > Finish. (Lưu ý: Quá trình này không làm gián đoạn máy ảo đang chạy)',
    prevention: 'Thiết lập cảnh báo ngưỡng dung lượng (Storage Threshold) ở mức 80%, Định kỳ kiểm tra và xóa các Checkpoint cũ',
    status: 'Active',
  },
  {
    id: 13,
    title: 'Xử lý lỗi Logon script (PowerShell) không chạy',
    category: 'system',
    description: 'Logon script tự động gửi email thông báo khi đăng nhập không chạy trên máy tính mới',
    symptoms: 'Kịch bản không gửi email khi user đăng nhập trên máy mới',
    rootCause: 'Execution Policy chặn script PowerShell hoặc đường dẫn UNC không được信任',
    solution: '1. Kiểm tra Execution Policy: Mở PowerShell với quyền Admin > Get-ExecutionPolicy.\n\n2. Nếu là Restricted, thay đổi: Set-ExecutionPolicy RemoteSigned.\n\n3. Kiểm tra đường dẫn UNC: Đảm bảo script được gọi từ đường dẫn mạng đúng.\n\n4. Unblock file: Chuột phải file .ps1 > Properties > Check "Unblock" > OK.\n\n5. Test chạy thủ công: PowerShell > & "\\\\server\\share\\script.ps1".',
    prevention: 'Đảm bảo Execution Policy được set trước khi triển khai, Unblock các file script sau khi copy từ máy khác',
    status: 'Active',
  },
]

const workLogs = [
  { id: 1, title: 'Server KTHT hết dung lượng ổ cứng', category: 'virtualization', clientName: 'Server KTHT', issueDescription: 'Ổ cứng server ảo hết dung lượng', solutionApplied: 'Share thêm dung lượng ổ cứng cho server ảo', timeSpent: '15 phút', result: 'Resolved', priority: 'Medium', workStatus: 'Completed' },
  { id: 2, title: 'User không mở Outlook được', category: 'user-support', clientName: 'Vương Hoài Ân', issueDescription: 'User báo không mở Outlook được, Outlook báo lỗi không xác định', solutionApplied: 'Tạo lại data mail mới cho User', timeSpent: '15 phút', result: 'Resolved', priority: 'Low', workStatus: 'Completed' },
  { id: 3, title: 'Lỗi line 977,978', category: 'user-support', clientName: 'Phạm Ngọc Thanh Vân', issueDescription: 'Line 977,978 gọi 872 không nghe gì', solutionApplied: 'Đổi server 1 của handset 2 line đó thành 192.168.1.10', timeSpent: '10 phút', result: 'Resolved', priority: 'Low', workStatus: 'Completed' },
  { id: 4, title: 'Lỗi không mở được S1', category: 'application', clientName: 'Mr Quân - KDS', issueDescription: 'Không mở được S1', solutionApplied: 'Cài lại S1', timeSpent: '15 phút', result: 'Resolved', priority: 'Medium', workStatus: 'completed' },
  { id: 5, title: 'Đề xuất gia hạn phần mềm Kaspersky', category: 'security', clientName: 'NKC', issueDescription: 'License Kaspersky hết hạn vào ngày 14/04/2026', solutionApplied: 'Đề xuất gia hạn license', timeSpent: '30 phút', result: 'Resolved', priority: 'Medium', workStatus: 'completed' },
  { id: 6, title: 'Máy in có côn trùng chui vào', category: 'printer', clientName: 'Phòng HCNS', issueDescription: 'Máy in có kiến chui vào ở dàn scan', solutionApplied: 'Vệ sinh, kiểm tra các chức năng, đảm bảo máy hoạt động bình thường', timeSpent: '60 phút', result: 'Resolved', priority: 'High', workStatus: 'completed' },
]

const assetCategories = [
  { id: 1, code: 'laptop', name: 'Laptop', description: 'Máy tính xách tay cho kiểm kê', icon: '💻', color: '#007bff' },
  { id: 2, code: 'barcode', name: 'Barcode Scanner', description: 'Máy quét barcode', icon: '📱', color: '#28a745' },
  { id: 3, code: 'pen', name: 'Bút', description: 'Bút viết cho ghi chép', icon: '✏️', color: '#6f42c1' },
  { id: 4, code: 'tape', name: 'Băng keo giấy', description: 'Băng keo dán nhãn', icon: '📏', color: '#fd7e14' },
  { id: 5, code: 'paper', name: 'Giấy', description: 'Giấy in ấn và ghi chép', icon: '📄', color: '#20c997' },
  { id: 6, code: 'other', name: 'Khác', description: 'Công cụ khác', icon: '🔧', color: '#6c757d' },
]

const emailTemplates = [
  {
    id: 1,
    name: 'Cảnh báo Virus',
    subject: '[WARNING] CẢNH BÁO VIRUS',
    content: 'Kính gửi Anh, Chị, Em,\n\nHiện tại hệ thống ghi nhận nhiều trường hợp email giả mạo chứa MÃ ĐỘC/VIRUS đang được phát tán. Để đảm bảo an toàn dữ liệu công ty, yêu cầu mọi người thực hiện nghiêm túc:\n\n1. KHÔNG CLICK vào bất kỳ đường link lạ nào (kể cả từ người quen nhưng nội dung email bất thường).\n\n2. KHÔNG TẢI/MỞ các file đính kèm đáng ngờ (đặc biệt các đuôi: .exe, .zip, .rar, .docm).\n\n3. XÓA NGAY email nếu thấy tiêu đề hoặc địa chỉ người gửi không rõ ràng.\n\nNếu lỡ ấn vào link hoặc tải file, hãy ngắt kết nối mạng ngay lập tức và liên hệ bộ phận IT để xử lý.',
    category: 'notification',
    tags: 'virus,security,warning',
  },
  {
    id: 2,
    name: 'Bảo trì Server',
    subject: '[THÔNG BÁO] Bảo trì nâng cấp hệ thống máy chủ (Server)',
    content: 'Kính gửi Anh, Chị, Em,\n\nĐể đảm bảo hệ thống vận hành ổn định và nâng cao hiệu suất phục vụ công việc, Bộ phận Kỹ Thuật sẽ tiến hành bảo trì hệ thống máy chủ.\n\nChi tiết kế hoạch bảo trì như sau:\n• Thời gian bắt đầu: [... Giờ : Phút ...] – Ngày [... / ... / 20...]\n• Thời gian dự kiến hoàn thành: [... Giờ : Phút ...] – Ngày [... / ... / 20...]\n\nLưu ý quan trọng: Trong thời gian trên, các dịch vụ sẽ tạm ngưng hoạt động. Đề nghị các Anh/Chị vui lòng:\n\n1. Lưu lại toàn bộ dữ liệu đang làm việc trước thời gian bảo trì.\n2. Thoát khỏi các phần mềm/hệ thống liên quan để tránh mất mát dữ liệu.\n\nHệ thống sẽ hoạt động bình thường trở lại ngay sau khi quá trình bảo trì kết thúc.',
    category: 'maintenance',
    tags: 'maintenance,server,notification',
  },
]

const netDevices = [
  { id: 1, name: 'NK-RT-FX-01', ip: '192.168.117.254', location: 'Tủ Rack', description: 'Router Draytek 3910', deviceType: 'router', status: 'active', company: 'NGUYÊN KIM' },
  { id: 2, name: 'NK-MD-FX-01', ip: '115.78.239.218', location: 'Tủ Rack', description: 'Line Internet Viettel Chính', deviceType: 'modem', status: 'active', company: 'NGUYÊN KIM' },
  { id: 3, name: 'NK-SW-FX-01', ip: '192.168.117.1', location: 'Tủ Rack', description: 'Switch Core', deviceType: 'switch', status: 'active', company: 'NGUYÊN KIM' },
  { id: 4, name: 'NKC-PP-FX-01', ip: '-', location: 'Tủ Rack', description: 'PP Quang Core', deviceType: 'network', status: 'active', company: 'NKC' },
  { id: 5, name: 'Server DC01', ip: '192.168.1.10', location: 'Phòng Server CN', description: 'Domain Controller 01', deviceType: 'server', status: 'active', company: 'Chính Nhân' },
  { id: 6, name: 'Server DC02', ip: '192.168.1.11', location: 'Phòng Server CN', description: 'Domain Controller 02', deviceType: 'server', status: 'active', company: 'Chính Nhân' },
  { id: 7, name: 'Router Vigor CN', ip: '192.168.1.1', location: 'Phòng Server CN', description: 'Router Chính Nhân', deviceType: 'router', status: 'active', company: 'Chính Nhân' },
  { id: 8, name: 'Switch Core CN', ip: '192.168.1.2', location: 'Phòng Server CN', description: 'Switch Core Chính Nhân', deviceType: 'switch', status: 'active', company: 'Chính Nhân' },
  { id: 9, name: 'NVR CN', ip: '192.168.1.100', location: 'Phòng Server CN', description: 'NVR Camera', deviceType: 'nvr', status: 'active', company: 'Chính Nhân' },
  { id: 10, name: 'UPS Server Room', ip: '192.168.1.200', location: 'Phòng Server CN', description: 'UPS cho phòng server', deviceType: 'ups', status: 'active', company: 'Chính Nhân' },
]

const netCables = [
  { id: 1, label: 'NK-FX-01', cableType: 'Cat6', fromDeviceName: 'NK-MD-FX-01', toDeviceName: 'NK-RT-FX-01', description: 'Modem -> Router NK' },
  { id: 2, label: 'NK-FX-03', cableType: 'DAC 10G', fromDeviceName: 'NK-RT-FX-01', toDeviceName: 'NK-SW-FX-01', description: 'Uplink Core 10G' },
]

export async function POST() {
  try {
    console.log('Starting database seed...')

    // Seed users
    for (const user of users) {
      await db.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      })
    }
    console.log('Seeded users')

    // Seed categories
    for (const cat of categories) {
      await db.category.upsert({
        where: { code: cat.code },
        update: cat,
        create: cat,
      })
    }
    console.log('Seeded categories')

    // Seed cases
    for (const c of cases) {
      await db.case.upsert({
        where: { id: c.id },
        update: c,
        create: c,
      })
    }
    console.log('Seeded cases')

    // Seed work logs (WorkLog model - work_logs table)
    for (const w of workLogs) {
      await db.workLog.upsert({
        where: { id: w.id },
        update: w,
        create: w,
      })
    }
    console.log('Seeded work logs')

    // Seed worklogs (Worklog model - worklogs table, used by the IT Handbook API)
    const worklogData = [
      { id: 1, title: 'Server KTHT hết dung lượng ổ cứng', category: 'virtualization', clientName: 'Server KTHT', issueDescription: 'Ổ cứng server ảo hết dung lượng', solutionApplied: 'Share thêm dung lượng ổ cứng cho server ảo', timeSpent: '15 phút', result: 'Resolved', priority: 'Medium', workStatus: 'completed', status: 'completed', description: '', tags: '[]', success: true, date: new Date('2025-01-15') },
      { id: 2, title: 'User không mở Outlook được', category: 'user-support', clientName: 'Vương Hoài Ân', issueDescription: 'User báo không mở Outlook được, Outlook báo lỗi không xác định', solutionApplied: 'Tạo lại data mail mới cho User', timeSpent: '15 phút', result: 'Resolved', priority: 'Low', workStatus: 'completed', status: 'completed', description: '', tags: '[]', success: true, date: new Date('2025-01-18') },
      { id: 3, title: 'Lỗi line 977,978', category: 'user-support', clientName: 'Phạm Ngọc Thanh Vân', issueDescription: 'Line 977,978 gọi 872 không nghe gì', solutionApplied: 'Đổi server 1 của handset 2 line đó thành 192.168.1.10', timeSpent: '10 phút', result: 'Resolved', priority: 'Low', workStatus: 'completed', status: 'completed', description: '', tags: '[]', success: true, date: new Date('2025-01-20') },
      { id: 4, title: 'Lỗi không mở được S1', category: 'application', clientName: 'Mr Quân - KDS', issueDescription: 'Không mở được S1', solutionApplied: 'Cài lại S1', timeSpent: '15 phút', result: 'Resolved', priority: 'Medium', workStatus: 'completed', status: 'completed', description: '', tags: '[]', success: true, date: new Date('2025-02-01') },
      { id: 5, title: 'Đề xuất gia hạn phần mềm Kaspersky', category: 'security', clientName: 'NKC', issueDescription: 'License Kaspersky hết hạn vào ngày 14/04/2026', solutionApplied: 'Đề xuất gia hạn license', timeSpent: '30 phút', result: 'Resolved', priority: 'Medium', workStatus: 'completed', status: 'completed', description: '', tags: '[]', success: true, date: new Date('2025-02-10') },
      { id: 6, title: 'Máy in có côn trùng chui vào', category: 'printer', clientName: 'Phòng HCNS', issueDescription: 'Máy in có kiến chui vào ở dàn scan', solutionApplied: 'Vệ sinh, kiểm tra các chức năng, đảm bảo máy hoạt động bình thường', timeSpent: '60 phút', result: 'Resolved', priority: 'High', workStatus: 'completed', status: 'completed', description: '', tags: '[]', success: true, date: new Date('2025-02-15') },
    ]
    for (const w of worklogData) {
      await db.worklog.upsert({
        where: { id: w.id },
        update: w,
        create: w,
      })
    }
    console.log('Seeded worklogs')

    // Seed asset categories
    for (const ac of assetCategories) {
      await db.assetCategory.upsert({
        where: { id: ac.id },
        update: ac,
        create: ac,
      })
    }
    console.log('Seeded asset categories')

    // Seed email templates
    for (const et of emailTemplates) {
      await db.emailTemplate.upsert({
        where: { id: et.id },
        update: et,
        create: et,
      })
    }
    console.log('Seeded email templates')

    // Seed net devices
    for (const nd of netDevices) {
      await db.netDevice.upsert({
        where: { id: nd.id },
        update: nd,
        create: nd,
      })
    }
    console.log('Seeded net devices')

    // Seed net cables
    for (const nc of netCables) {
      await db.netCable.upsert({
        where: { id: nc.id },
        update: nc,
        create: nc,
      })
    }
    console.log('Seeded net cables')

    // Seed workflow matrix (only if no columns exist yet)
    const existingWorkflowCount = await db.workflowColumn.count()
    if (existingWorkflowCount === 0) {
      const workflowColumnsData = [
        {
          title: 'SLA & HOTLINE',
          subtitle: 'Phản Ứng Nhanh',
          description: 'Trực tiếp hỗ trợ người dùng & SME',
          color: 'rose',
          target: 'Xử lý 100% Ticket & Duy trì SLA',
          sortOrder: 0,
          items: {
            create: [
              { title: 'IT Helpdesk Nội Bộ', description: 'Tiếp nhận báo lỗi, xử lý lỗi Mail/IP Phone, Software, Hardware cài đặt phần mềm & hỗ trợ kỹ thuật trực tiếp.', timeEstimate: '1-2h/ngày', sortOrder: 0 },
              { title: 'Setup & Cài Đặt Hệ Thống', description: 'Cài đặt OS, tủ driver, cấu hình phân quyền & bảo mật cho thiết bị cấp phát mới hoặc xử lý lỗi.', timeEstimate: '2-3h/máy', sortOrder: 1 },
              { title: 'Hotline SME (Cuối Quý)', description: 'Trực tiếp dây nóng Chánh Nhân/Nguyên Kim, hướng dẫn xử lý kỹ thuật từ xa cho khách hàng.', timeEstimate: '2-3h/ngày', sortOrder: 2 },
            ],
          },
        },
        {
          title: 'HẠ TẦNG & LOG',
          subtitle: 'Vận Hành Hệ Thống',
          description: 'Duy trì sự ổn định của Công Ty',
          color: 'amber',
          target: 'Tính sẵn sàng hệ thống 99.9%',
          sortOrder: 1,
          items: {
            create: [
              { title: 'Backup & Security Dashboard', description: 'Kiểm tra kết quả backup Veeam, Server, Database. Giám sát trạng thái Camera & đầu ghi tập trung.', timeEstimate: '45p/ngày', sortOrder: 0 },
              { title: 'Bảo Hành Máy In HP A3 5 số', description: 'Điều phối HP ủy quyền, order linh kiện, điều phối case, quản trị case & xuất chứng từ bàn giao PDF.', timeEstimate: '1-1.5h/ngày', sortOrder: 1 },
              { title: 'Hậu Cần Phòng Hợp', description: 'Setup Laptop, máy chiếu, TV, âm thanh hội nghị. Đảm bảo Internet ổn định cho các buổi họp trực tuyến.', timeEstimate: 'T2 & T7', sortOrder: 2 },
            ],
          },
        },
        {
          title: 'PRESALE & BIZ',
          subtitle: 'Giải Pháp SME',
          description: 'Thương mại hóa & Tư vấn giải pháp',
          color: 'emerald',
          target: 'Đề xuất chuẩn & Giải pháp trọn gói',
          sortOrder: 2,
          items: {
            create: [
              { title: 'Nghiên Cứu SME Bundle', description: 'Xây dựng phương án kỹ thuật, cấu hình thiết bị mẫu & đánh giá khả năng tích hợp dựa trên văn bản của 3 công ty NKC.', timeEstimate: '4-5h/ngày', sortOrder: 0 },
              { title: 'Procurement (Đề xuất)', description: 'Đánh giá nhà cung cấp mới, thẩm định cấu hình & phù hợp HCNS dự kiến phi mua sắm/sửa chữa thiết bị tiêu dùng.', timeEstimate: '30-60p/ngày', sortOrder: 1 },
              { title: 'Email Admin (Đầu Quý)', description: 'Xuất & lưu trữ dữ liệu Mail BGD sang định dạng PST. Giải phóng dung lượng data mail.', timeEstimate: '3-4h/đợt', sortOrder: 2 },
            ],
          },
        },
        {
          title: 'PERIODIC SECURITY',
          subtitle: 'Bảo Trì & An Ninh',
          description: 'Kiểm soát rủi ro định kỳ',
          color: 'slate',
          target: 'An toàn hệ thống 100%',
          sortOrder: 3,
          items: {
            create: [
              { title: 'Bảo Trì Hạ Tầng Toàn Diện', description: 'Vệ sinh, bảo trì phần cứng toàn bộ dàn máy tính, Server & hệ thống máy in của toàn công ty.', timeEstimate: '6 tháng/lần', sortOrder: 0 },
              { title: 'Kiểm Tra Báo Động & UPS', description: 'Kiểm tra hệ thống báo động cửa, UPS & nguồn dự phòng. Thiết lập chế độ cảnh báo cho kỳ nghỉ dài.', timeEstimate: 'Trước Lễ', sortOrder: 1 },
              { title: 'Xác Thực Dự Phòng', description: 'Kiểm tra trang thiết bị và khả năng chịu tải của UPS và tính sẵn sàng.', timeEstimate: 'Trước Lễ', sortOrder: 2 },
            ],
          },
        },
      ]

      for (const wc of workflowColumnsData) {
        await db.workflowColumn.create({ data: wc })
      }
      console.log('Seeded workflow columns')
    } else {
      console.log('Workflow columns already exist, skipping seed')
    }

    return NextResponse.json({
      success: true,
      message: 'Đã nạp dữ liệu thành công!',
      data: {
        users: users.length,
        categories: categories.length,
        cases: cases.length,
        workLogs: workLogs.length,
        assetCategories: assetCategories.length,
        emailTemplates: emailTemplates.length,
        netDevices: netDevices.length,
        netCables: netCables.length,
        workflowColumns: existingWorkflowCount === 0 ? workflowColumnsData.length : existingWorkflowCount,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Sử dụng phương thức POST để nạp dữ liệu vào cơ sở dữ liệu',
    endpoint: 'POST /api/seed',
    tables: ['users', 'categories', 'cases', 'work_logs', 'asset_categories', 'email_templates', 'net_devices', 'net_cables', 'workflow_columns', 'workflow_items'],
  })
}
