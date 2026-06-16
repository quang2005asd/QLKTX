<script setup lang="ts">
const quickActions = [
  {
    title: 'Tra cứu phòng đang còn chỗ',
    text: 'Xem nhanh danh sách phòng phù hợp để đăng ký nội trú hoặc điều phối chỗ ở.',
    icon: 'mdi-bed-outline',
  },
  {
    title: 'Theo dõi hồ sơ đăng ký',
    text: 'Kiểm tra trạng thái xét duyệt hồ sơ, hợp đồng và lịch sử đăng ký của sinh viên.',
    icon: 'mdi-file-document-outline',
  },
  {
    title: 'Quản lý hóa đơn và hỗ trợ',
    text: 'Tổng hợp các khoản thanh toán, yêu cầu hỗ trợ và tiến độ xử lý nội bộ.',
    icon: 'mdi-cash-register',
  },
]

const insightCards = [
  { value: '128', label: 'Phòng đang sẵn sàng', tone: 'purple' },
  { value: '42', label: 'Yêu cầu chờ duyệt', tone: 'sand' },
  { value: '18', label: 'Thông báo mới', tone: 'blue' },
]
</script>

<template>
  <div class="overview-page">
    <section class="overview-hero">
      <div>
        <div class="overview-eyebrow">Tổng quan hệ thống</div>
        <h1 class="overview-title">Không gian quản lý tập trung cho ký túc xá đại học</h1>
        <p class="overview-copy">
          Từ đây, người dùng có thể theo dõi đăng ký nội trú, còn quản trị viên có thể điều phối phòng ở, hợp đồng,
          hóa đơn và các dịch vụ vận hành trên cùng một giao diện.
        </p>
      </div>

      <div class="overview-hero-card">
        <div class="hero-card-kicker">Phiên làm việc hiện tại</div>
        <div class="hero-card-title">Sẵn sàng thao tác</div>
        <div class="hero-card-text">
          Hệ thống đã được chia thành các khu vực nghiệp vụ riêng để thuận tiện cho người dùng và ban quản lý.
        </div>
      </div>
    </section>

    <section class="insight-grid">
      <article
        v-for="card in insightCards"
        :key="card.label"
        :class="['insight-card', `insight-card--${card.tone}`]"
      >
        <div class="insight-value">{{ card.value }}</div>
        <div class="insight-label">{{ card.label }}</div>
      </article>
    </section>

    <section class="overview-section">
      <div class="section-heading">
        <div>
          <div class="section-eyebrow">Tác vụ nhanh</div>
          <div class="section-title">Các khu vực chính trong hệ thống</div>
        </div>
      </div>

      <div class="action-grid">
        <article v-for="action in quickActions" :key="action.title" class="action-card">
          <div class="action-icon">
            <v-icon :icon="action.icon" size="30" />
          </div>
          <h3>{{ action.title }}</h3>
          <p>{{ action.text }}</p>
        </article>
      </div>
    </section>

    <section class="overview-section overview-section-soft">
      <div class="section-heading">
        <div>
          <div class="section-eyebrow">Cấu trúc nghiệp vụ</div>
          <div class="section-title">Ba phân hệ đang chờ kết nối dữ liệu thực</div>
        </div>
      </div>

      <div class="module-grid">
        <article class="module-card">
          <div class="module-title">Phòng & Tòa nhà</div>
          <p>Quản lý thông tin tòa nhà, loại phòng, sơ đồ tầng, số chỗ trống và tình trạng sử dụng.</p>
        </article>

        <article class="module-card">
          <div class="module-title">Sinh viên & Hợp đồng</div>
          <p>Theo dõi hồ sơ đăng ký, hợp đồng nội trú, danh sách ở và lịch sử lưu trú của sinh viên.</p>
        </article>

        <article class="module-card">
          <div class="module-title">Hóa đơn & Bảo trì</div>
          <p>Kiểm soát thanh toán, thông báo tài chính, yêu cầu sửa chữa và công việc hỗ trợ vận hành.</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.overview-page {
  display: grid;
  gap: 22px;
}

.overview-hero,
.overview-section,
.action-card,
.module-card,
.insight-card {
  border: 1px solid rgba(128, 109, 158, 0.12);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 28px rgba(56, 43, 77, 0.05);
}

.overview-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.8fr);
  gap: 20px;
  padding: 28px;
}

.overview-eyebrow,
.section-eyebrow,
.hero-card-kicker {
  color: rgba(43, 36, 48, 0.58);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.overview-title,
.section-title,
.hero-card-title {
  color: #2d2732;
  font-family: var(--font-serif);
  font-weight: 700;
}

.overview-title {
  margin: 10px 0 12px;
  font-size: 2.35rem;
  line-height: 1.15;
}

.overview-copy,
.hero-card-text,
.action-card p,
.module-card p {
  color: rgba(43, 36, 48, 0.66);
  line-height: 1.8;
}

.overview-hero-card {
  padding: 22px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(244, 239, 250, 0.9), rgba(255, 255, 255, 0.94));
}

.hero-card-title {
  margin: 10px 0 10px;
  font-size: 1.45rem;
}

.insight-grid,
.action-grid,
.module-grid {
  display: grid;
  gap: 18px;
}

.insight-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.insight-card {
  padding: 24px;
}

.insight-card--purple {
  background: linear-gradient(180deg, rgba(244, 239, 250, 0.95), rgba(255, 255, 255, 0.95));
}

.insight-card--sand {
  background: linear-gradient(180deg, rgba(248, 241, 233, 0.95), rgba(255, 255, 255, 0.95));
}

.insight-card--blue {
  background: linear-gradient(180deg, rgba(234, 243, 251, 0.95), rgba(255, 255, 255, 0.95));
}

.insight-value {
  color: #6f5aa6;
  font-size: 2.2rem;
  font-weight: 800;
}

.insight-label {
  margin-top: 8px;
  color: rgba(43, 36, 48, 0.68);
  font-weight: 600;
}

.overview-section {
  padding: 24px;
}

.overview-section-soft {
  background: rgba(248, 245, 251, 0.88);
}

.section-heading {
  margin-bottom: 18px;
}

.section-title {
  margin-top: 8px;
  font-size: 1.8rem;
}

.action-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.action-card {
  padding: 22px;
  transition: transform 0.28s ease, box-shadow 0.28s ease;
}

.action-card:hover,
.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 34px rgba(56, 43, 77, 0.08);
}

.action-icon {
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  margin-bottom: 14px;
  border-radius: 16px;
  background: rgba(111, 90, 166, 0.1);
  color: #6f5aa6;
}

.action-card h3,
.module-title {
  margin-bottom: 10px;
  color: #2d2732;
  font-size: 1.12rem;
  font-weight: 800;
}

.module-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.module-card {
  padding: 22px;
  transition: transform 0.28s ease, box-shadow 0.28s ease;
}

@media (max-width: 1080px) {
  .overview-hero,
  .action-grid,
  .module-grid {
    grid-template-columns: 1fr;
  }

  .insight-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .overview-title {
    font-size: 2rem;
  }

  .insight-grid {
    grid-template-columns: 1fr;
  }
}
</style>
