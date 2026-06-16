<template>
  <div class="not-found-page">
    <div class="not-found-card">
      <div class="not-found-code">404</div>
      <div class="not-found-title">Không tìm thấy trang bạn cần</div>
      <p class="not-found-text">
        Có thể đường dẫn không còn tồn tại hoặc bạn đang truy cập nhầm khu vực. Quay lại trang tổng quan để tiếp tục.
      </p>
      <v-btn class="mt-6" color="primary" rounded="lg" to="/app/overview">Về tổng quan</v-btn>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 60vh;
  display: grid;
  place-items: center;
}

.not-found-card {
  width: min(100%, 620px);
  padding: 38px 28px;
  border: 1px solid rgba(128, 109, 158, 0.12);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 36px rgba(56, 43, 77, 0.06);
  text-align: center;
}

.not-found-code {
  color: #6f5aa6;
  font-family: var(--font-serif);
  font-size: 4rem;
  font-weight: 700;
}

.not-found-title {
  margin-top: 10px;
  color: #2d2732;
  font-size: 1.6rem;
  font-weight: 800;
}

.not-found-text {
  margin: 14px auto 0;
  max-width: 460px;
  color: rgba(43, 36, 48, 0.66);
  line-height: 1.8;
}
</style>
