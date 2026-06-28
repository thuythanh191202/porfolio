# Portfolio Nguyễn Thị Thanh Thủy

## Chạy ở máy local

```powershell
npm install
npm run dev
```

Vite sẽ hiển thị địa chỉ local trong terminal.

## Build để deploy

```powershell
npm run build
npm run preview
```

Thư mục `dist/` là đầu ra sẵn sàng để deploy. Lệnh build sẽ:

- sao chép `index.html` và toàn bộ tài nguyên cần thiết vào `dist/`;
- chuyển ảnh PNG/JPG trong `imgs/` sang WebP;
- giới hạn chiều rộng ảnh tối đa ở 2400 px;
- tự cập nhật đường dẫn ảnh trong HTML và JavaScript;
- thêm lazy loading cho ảnh ngoài màn hình đầu tiên.

Các ảnh gốc trong `imgs/` không bị thay đổi. Khi thêm ảnh mới, chỉ cần đặt ảnh vào
`imgs/`, tham chiếu bằng đường dẫn tương đối trong `index.html`, rồi build lại.
