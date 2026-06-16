<script setup lang="ts">
const dormitoryContent = {
  schoolName: 'Đại học Đại Nam',
  shortName: 'DNU',
  location: 'Phú Lãm, Hà Đông, Hà Nội',
  heroImage:
    'https://images2.thanhnien.vn/528068263637045248/2023/8/5/ky-tuc-xa-1691238091365655865589.png',
  galleryImages: [
    'https://unizone.edu.vn/wp-content/uploads/2021/08/ktx-dai-hoc-dai-nam.jpg',
    'https://cdnphoto.dantri.com.vn/sTA_ap8QAsHPx9mArO5kq7fmej8=/thumb_w/1360/2025/07/11/0j7a6558jpg-1752249598664.jpg',
    'https://cdnphoto.dantri.com.vn/BzwZLYSdMylUazEHJW-sLeOXc4c=/thumb_w/1360/2025/07/11/0j7a6583jpg-1752249598639.jpg',
  ],
}
</script>

<template>
  <v-app>
    <v-main class="dormitory-page">
      <section class="dormitory-hero">
        <div class="dormitory-shell hero-layout">
          <div class="hero-copy">
            <div class="hero-kicker">Trang giới thiệu riêng</div>
            <h1>Ký túc xá {{ dormitoryContent.schoolName }} hiện đại, tiện nghi và đáng ở thật</h1>
            <p>
              Khu KTX của {{ dormitoryContent.shortName }} là một trong những điểm nổi bật nhất về cơ sở vật chất,
              được vận hành theo hướng hiện đại, an toàn và tối ưu cho việc học tập lẫn sinh hoạt hàng ngày.
            </p>

            <div class="hero-meta">
              <div class="hero-meta-item">
                <v-icon icon="mdi-map-marker-outline" size="18" />
                <span>{{ dormitoryContent.location }}</span>
              </div>
              <div class="hero-meta-item">
                <v-icon icon="mdi-office-building-outline" size="18" />
                <span>Tòa KTX 15 tầng, 389 phòng</span>
              </div>
              <div class="hero-meta-item">
                <v-icon icon="mdi-account-group-outline" size="18" />
                <span>Sức chứa gần 3.000 sinh viên</span>
              </div>
            </div>
          </div>

          <div class="hero-visual">
            <img :src="dormitoryContent.heroImage" alt="Ký túc xá Đại Nam" class="hero-image" />
          </div>
        </div>
      </section>

      <section class="dormitory-section">
        <div class="dormitory-shell">
          <div class="section-head">
            <div class="section-kicker">Tổng quan thực tế</div>
            <h2>Một khu nội trú nằm ngay trong trường, đi học chỉ mất vài bước chân</h2>
          </div>

          <div class="content-grid">
            <article class="info-card">
              <h3>1. Vị trí "vàng" ngay trong khuôn viên</h3>
              <p>
                Khu KTX nằm ngay trong khuôn viên chính của trường tại Phú Lãm, Hà Đông. Từ phòng ở có thể đi bộ
                nhanh đến giảng đường, thư viện, canteen và khu thể thao mà không cần phụ thuộc vào xe buýt hay lo
                cảnh tắc đường.
              </p>
              <p>
                Đây là lợi thế rất rõ với sinh viên có lịch học dày, đặc biệt các khối ngành Sức khỏe như Y, Dược,
                khi việc di chuyển gọn và ổn định giúp giảm khá nhiều áp lực sinh hoạt hàng ngày.
              </p>
            </article>

            <article class="info-card">
              <h3>2. Quy mô lớn, thiết kế phòng linh hoạt</h3>
              <p>
                Tòa KTX mới cao 15 tầng với 389 phòng, phục vụ gần 3.000 sinh viên. Phòng được bố trí từ 2 đến 8
                người để phù hợp nhiều nhu cầu ở khác nhau, từ ổn định lâu dài đến tối ưu chi phí.
              </p>
              <p>
                Mỗi phòng đều có điều hòa, bình nóng lạnh, Wi‑Fi tốc độ cao, cửa sổ lớn, ban công thoáng và không
                gian học tập riêng cho từng người.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section class="dormitory-section dormitory-section-soft">
        <div class="dormitory-shell">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">15</div>
              <div class="stat-label">Tầng</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">389</div>
              <div class="stat-label">Phòng</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">2-8</div>
              <div class="stat-label">Sinh viên / phòng</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">3000</div>
              <div class="stat-label">Sức chứa gần đúng</div>
            </div>
          </div>
        </div>
      </section>

      <section class="dormitory-section">
        <div class="dormitory-shell showcase-layout">
          <div class="showcase-copy">
            <div class="section-kicker">Phòng ở</div>
            <h2>Không còn kiểu KTX cũ, mà là một không gian ở chỉn chu và riêng tư hơn hẳn</h2>
            <ul class="feature-list">
              <li>Giường tầng chắc chắn, có rèm che tạo cảm giác riêng tư.</li>
              <li>Tủ cá nhân dùng khóa mật mã an toàn cho từng sinh viên.</li>
              <li>Bàn học và giá sách riêng, thuận tiện cho tự học mỗi ngày.</li>
              <li>Phòng có cửa sổ lớn và ban công, đón sáng tự nhiên tốt.</li>
            </ul>
          </div>

          <div class="showcase-gallery">
            <img :src="dormitoryContent.galleryImages[0]" alt="Không gian KTX" class="gallery-main" />
            <div class="gallery-side">
              <img :src="dormitoryContent.galleryImages[1]" alt="Phòng ở KTX" class="gallery-side-image" />
              <img :src="dormitoryContent.galleryImages[2]" alt="Khu nội trú DNU" class="gallery-side-image" />
            </div>
          </div>
        </div>
      </section>

      <section class="dormitory-section dormitory-section-soft">
        <div class="dormitory-shell">
          <div class="section-head">
            <div class="section-kicker">Tiện ích nội khu</div>
            <h2>Một tòa nhà giải quyết gần như trọn bộ nhu cầu sinh hoạt và học tập</h2>
          </div>

          <div class="amenity-grid">
            <article class="amenity-card">
              <div class="amenity-icon">
                <v-icon icon="mdi-elevator" size="28" />
              </div>
              <h3>Di chuyển & an ninh</h3>
              <p>Thang máy tốc độ cao, kiểm soát ra vào bằng vân tay, camera giám sát và bảo vệ trực 24/7.</p>
            </article>

            <article class="amenity-card">
              <div class="amenity-icon">
                <v-icon icon="mdi-book-open-page-variant-outline" size="28" />
              </div>
              <h3>Khu chức năng chung</h3>
              <p>Sảnh tiếp đón, phòng sinh hoạt chung, phòng đọc sách và khu học nhóm được bố trí đầy đủ.</p>
            </article>

            <article class="amenity-card">
              <div class="amenity-icon">
                <v-icon icon="mdi-storefront-outline" size="28" />
              </div>
              <h3>Dịch vụ thiết yếu</h3>
              <p>Canteen, cửa hàng tiện lợi, giặt là và khu lấy nước uống đã lọc ngay trong nội khu.</p>
            </article>

            <article class="amenity-card">
              <div class="amenity-icon">
                <v-icon icon="mdi-school-outline" size="28" />
              </div>
              <h3>Tối ưu cho việc học</h3>
              <p>Môi trường ổn định, an toàn và gần giảng đường giúp sinh viên tập trung học hành hơn hẳn.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="dormitory-section">
        <div class="dormitory-shell closing-panel">
          <div class="section-kicker">Đánh giá tổng thể</div>
          <h2>KTX Đại Nam đang đi theo mô hình “khu đô thị thu nhỏ” dành cho sinh viên</h2>
          <p>
            Tổng thể mà nói, đây là một môi trường sống khá đáng giá nếu muốn ở ổn định để tập trung học tập lâu
            dài. Vị trí thuận tiện, phòng ở được đầu tư tốt, an ninh bài bản và tiện ích nội khu đủ mạnh để phục vụ
            nhịp sống sinh viên hằng ngày.
          </p>
          <p>
            Nếu đang tìm một nơi vừa hiện đại, vừa an toàn, lại giảm đáng kể thời gian di chuyển đến lớp thì đăng ký
            ở KTX này là một lựa chọn rất hợp lý.
          </p>

          <div class="closing-actions">
            <v-btn color="primary" rounded="pill" size="large" to="/register">Đăng ký ngay</v-btn>
            <v-btn rounded="pill" size="large" variant="outlined" to="/">Về trang chủ</v-btn>
          </div>
        </div>
      </section>
    </v-main>
  </v-app>
</template>

<style scoped src="/src/core/views/DormitoryIntroView.css"></style>
