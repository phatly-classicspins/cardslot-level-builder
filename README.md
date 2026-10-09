# CardSlot Level Builder — bản thử

Mở `index.html` bằng Chrome/Edge. Không cần cài package, không cần internet.
Hoặc chạy `node serve.cjs`, rồi mở http://127.0.0.1:8767.

- Chọn một màn mẫu (1–5, và 7 / 12 / 17 có element), kéo thả cọc, chọn màu để thêm cọc.
- Chỉnh tầng, vùng chặn W/H, số lá, kiểu xòe thẳng/vòng, chiều thuận/ngược và hướng xòe.
- Cọc phía trên tự tìm cọc đỡ theo `StackPlacementRules`; có thể chọn `on_stack` rõ ràng khi cần. Tầng phải thấp hơn, giao vùng và cùng góc xòe.
- Đường tím là quan hệ nối xòe. Bật **Vùng chặn** để xem rectangle gameplay và các đường chặn màu cam. Quan hệ chặn được suy ra theo rule hiện tại của game, không lưu trường BlockedNodes không được game hỗ trợ.
- **Dàn cọc như game** mô phỏng bước tránh va chạm giữa các nhóm cọc của Board3DView. Tắt để xem hình học trước khi dàn. Đây là preview SVG mặt trên; không phải render 3D/camera Unity chính xác từng pixel.
- **Bấm thử** chạy đúng luật của game (`BoardModel`, GDD v2.0): chạm thì lá bay lần lượt tới khi một lá không còn chỗ — lá đó và phần còn lại ở lại cọc (D-041); thua khi ô chờ đầy và không lá ô chờ / cọc mở nào cùng màu với cọc đích đang nhận, hoặc không còn nước nào (D-040); chặn theo tầng/màu, hàng đợi chia theo từng cột đích. Có cả element: cọc úp mặt, cọc đích ẩn, cọc khoá. Không có booster/revive. Khi thắng có thể lưu `solution`.
- **Element** (thuộc tính cọc → Element; ô **?** cạnh mỗi đích): *Úp mặt* (`hidden: true`, từ màn 7) — úp khi bị che, hết che thì lộ màu mãi, khi còn úp thì che mọi cọc bên dưới. *Khoá* (`lock: 1–4`, từ màn 17) — không chạm được, đếm sau lần đầu hết bị che, mỗi cọc đích xong −1, còn lại toàn màu bị khoá thì mở ngay. *Đích ẩn* (`hidden: true` trên đích, từ màn 12) — hiện "?" khi còn trong hàng chờ, lộ màu khi xuống đáy.
- Ctrl+Z / Ctrl+Y, Ctrl+D, Delete; F vừa khung. Kéo nền để pan, lăn chuột zoom.
- JSON giữ định dạng CardSlot hiện có; giữ các trường bổ sung. Chỉnh config sẽ bỏ solution cũ để tránh lưu lời giải đã lỗi thời.
- **Lưu bản nháp** lưu trên trình duyệt, không ghi file project. Luôn xuất JSON để có bản độc lập.

## Đưa config vào Unity

1. Sửa hết lỗi trong mục Kiểm tra config và xuất JSON.
2. Thay file tương ứng trong `Assets/CardSlot/Content/Levels/` (sao lưu trước nếu muốn giữ phiên bản cũ).
3. Với màn mới, chạy menu `CardSlot/Content/Build` để cập nhật LevelCatalog. Màn thay thế dùng catalog hiện có.
4. Mở màn trong Unity để kiểm tra hình ảnh và gameplay thực tế.

Khoảng cách xòe hiện dùng quy tắc toàn game: 18 units/lá, bước vòng 12°, độ mở cọc gốc tối đa 60°. Tool không xuất trường khoảng cách tùy ý vì runtime chưa đọc trường đó. Cọc trên tiếp tục chuỗi lá của cọc gốc nên có thể mở vượt góc gốc.

Màu lấy từ `DesignTokens.CardFace`: 0 đỏ, 1 xanh dương, 2 vàng, 3 xanh lá, 4 tím, 5 cam, 6 hồng, 7 cyan.

## Kiểm tra

`node core.test.cjs`

Các màn mẫu là snapshot của 5 file level hiện tại. Import JSON để mở phiên bản mới hơn.
