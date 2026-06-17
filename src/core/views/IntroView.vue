<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { resolveServiceBaseUrl } from '@/core/api/serviceBaseUrl'

const branding = {
  schoolName: 'Đại Nam',
  logoUrl: 'https://www.senviet.art/wp-content/uploads/edd/2021/12/dainam.jpg',
}

const mediaLinks = {
  heroSlides: [
    'https://minhanhgroup.vn/wp-content/uploads/2022/08/eehmguwbabc77cyq7rz720220614082105_thump.jpg',
    'https://images2.thanhnien.vn/528068263637045248/2023/8/5/ky-tuc-xa-1691238091365655865589.png',
    'https://unizone.edu.vn/wp-content/uploads/2021/08/ktx-dai-hoc-dai-nam.jpg',
  ],
  campusImage:
    'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80',
  roomImage:
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  studyImage:
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
  roomStandard:
    'https://cdn.lozido.com/image/news/64565b3e9bb11-1683381054-ky-tuc-xa-tu-nhanjpg.jpg',
  roomVip:
    'https://tse2.mm.bing.net/th/id/OIP.mGlakF37fxA-k0hKoz83NQHaEn?rs=1&pid=ImgDetMain&o=7&rm=3',
  roomBunk:
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80&sat=-30',
  experienceMain:
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
  experienceTop:
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
  experienceBottom:
    'https://images.unsplash.com/photo-1486946255434-2466348c2166?auto=format&fit=crop&w=900&q=80',
}

type IntroRoomCard = {
  id: string
  badge: string
  title: string
  description: string
  capacity: string
  price: string
  imageUrl: string
}

type IntroRoomTypeApi = {
  id: string
  imageUrl?: string | null
  typeName: string
  capacity: number
  basePrice: number
  description?: string | null
}

const roomApiBaseUrl = resolveServiceBaseUrl(
  import.meta.env.VITE_ROOM_BUILDING_API_URL,
  5285,
  import.meta.env.VITE_ROOM_BUILDING_PUBLIC_API_URL,
)

const fallbackRoomCards: IntroRoomCard[] = [
  {
    id: 'fallback-standard',
    badge: 'Tiêu chuẩn',
    title: 'Standard',
    description: 'Phòng 4 người, đầy đủ tiện nghi cơ bản, phù hợp cho sinh viên năm nhất.',
    capacity: '4 người',
    price: '1.200.000đ/tháng',
    imageUrl: mediaLinks.roomStandard,
  },
  {
    id: 'fallback-vip',
    badge: 'Cao cấp',
    title: 'VIP',
    description: 'Phòng 2 người, không gian rộng hơn, phù hợp cho nhu cầu ở ổn định dài hạn.',
    capacity: '2 người',
    price: '1.800.000đ/tháng',
    imageUrl: mediaLinks.roomVip,
  },
  {
    id: 'fallback-bunk',
    badge: 'Tiết kiệm',
    title: 'Giường tầng',
    description: 'Tối ưu diện tích, chi phí hợp lý, phù hợp cho sinh viên ưu tiên ngân sách.',
    capacity: '6 người',
    price: '950.000đ/tháng',
    imageUrl: mediaLinks.roomBunk,
  },
]

const roomShowcaseCards = ref<IntroRoomCard[]>([])
const currentRoomPage = ref(0)
const roomCardsPerView = ref(3)

let revealObserver: IntersectionObserver | null = null

function handleImageError(event: Event) {
  const image = event.target as HTMLImageElement | null
  const fallback = image?.dataset.fallback

  if (!image || !fallback || image.src === fallback) return
  image.src = fallback
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function getRoomBadgeByCapacity(capacity: number) {
  if (capacity <= 2) return 'Cao cấp'
  if (capacity >= 6) return 'Tiết kiệm'
  return 'Tiêu chuẩn'
}

function getFallbackRoomImage(index: number) {
  const images = [mediaLinks.roomStandard, mediaLinks.roomVip, mediaLinks.roomBunk]
  return images[index % images.length]
}

async function loadRoomShowcase() {
  try {
    const response = await fetch(`${roomApiBaseUrl}/api/roomtypes`)
    if (!response.ok) throw new Error('Không tải được danh sách loại phòng')

    const roomTypes = (await response.json()) as IntroRoomTypeApi[]
    const cards = roomTypes
      .slice(0, 3)
      .map((roomType, index) => ({
        id: roomType.id,
        badge: getRoomBadgeByCapacity(roomType.capacity ?? 4),
        title: roomType.typeName ?? `Loại phòng ${index + 1}`,
        description:
          roomType.description?.trim() ||
          'Không gian nội trú hiện đại, phù hợp cho sinh viên đăng ký lưu trú dài hạn.',
        capacity: `${roomType.capacity ?? 0} người`,
        price: formatCurrency(roomType.basePrice ?? 0) + '/tháng',
        imageUrl: roomType.imageUrl || getFallbackRoomImage(index),
      }))

    roomShowcaseCards.value = cards.length > 0 ? cards : fallbackRoomCards
  } catch {
    roomShowcaseCards.value = fallbackRoomCards
  }

  await nextTick()
  observeRevealTargets()
}

const displayedRoomCards = computed(() => roomShowcaseCards.value.length > 0 ? roomShowcaseCards.value : fallbackRoomCards)
const roomPageCount = computed(() => Math.max(1, Math.ceil(displayedRoomCards.value.length / roomCardsPerView.value)))
const visibleRoomCards = computed(() => {
  const start = currentRoomPage.value * roomCardsPerView.value
  return displayedRoomCards.value.slice(start, start + roomCardsPerView.value)
})

function observeRevealTargets() {
  if (!revealObserver) return
  const revealTargets = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)')
  revealTargets.forEach((target) => revealObserver?.observe(target))
}

function updateRoomCardsPerView() {
  if (window.innerWidth <= 720) {
    roomCardsPerView.value = 1
    return
  }

  if (window.innerWidth <= 1080) {
    roomCardsPerView.value = 2
    return
  }

  roomCardsPerView.value = 3
}

function showPreviousRoomPage() {
  currentRoomPage.value = currentRoomPage.value <= 0 ? roomPageCount.value - 1 : currentRoomPage.value - 1
}

function showNextRoomPage() {
  currentRoomPage.value = currentRoomPage.value >= roomPageCount.value - 1 ? 0 : currentRoomPage.value + 1
}

watch([displayedRoomCards, roomCardsPerView], () => {
  if (currentRoomPage.value > roomPageCount.value - 1) {
    currentRoomPage.value = Math.max(0, roomPageCount.value - 1)
  }
})

onMounted(() => {
  updateRoomCardsPerView()
  window.addEventListener('resize', updateRoomCardsPerView)

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver?.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -40px 0px',
    },
  )

  observeRevealTargets()
  loadRoomShowcase()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateRoomCardsPerView)
  revealObserver?.disconnect()
  revealObserver = null
})
</script>

<template>
  <v-app>
    <v-main class="showcase-page">
      <header class="showcase-header">
        <div class="showcase-shell header-inner">
          <div class="brand-wrap">
            <img :src="branding.logoUrl" alt="Logo trường" class="brand-logo" :data-fallback="mediaLinks.campusImage" @error="handleImageError" />
            <div class="brand-name">{{ branding.schoolName }}</div>
          </div>

          <nav class="showcase-nav">
            <a href="#trang-chu">Trang chủ</a>
            <RouterLink to="/gioi-thieu-ktx-dai-nam">Giới thiệu</RouterLink>
            <a href="#loai-phong">Loại phòng</a>
            <a href="#huong-dan">Hướng dẫn</a>
            <a href="#thong-bao">Thông báo</a>
            <RouterLink to="/login">Đăng nhập</RouterLink>
          </nav>

          <v-btn class="apply-btn" color="primary" rounded="lg" to="/register">
            Đăng ký ngay
          </v-btn>
        </div>
      </header>

      <section id="trang-chu" class="hero-section">
        <div class="showcase-shell hero-frame">
          <div class="hero-background">
            <div class="hero-slideshow">
              <img
                v-for="(slide, index) in mediaLinks.heroSlides"
                :key="slide"
                :src="slide"
                :alt="`Hình ký túc xá ${index + 1}`"
                class="hero-slide"
              />
            </div>
            <div class="hero-visual-overlay"></div>
          </div>

          <div class="hero-layout">
            <div class="hero-copy" data-reveal>
              <div class="hero-badge">Ký túc xá đại học hiện đại</div>
              <h1>Chào mừng đến với Ký túc xá {{ branding.schoolName }}</h1>
              <p>
                Môi trường sống hiện đại, an toàn và tiện nghi dành cho sinh viên. Tra cứu phòng, đăng ký ở, theo dõi
                hợp đồng và sử dụng dịch vụ nội trú trên cùng một hệ thống.
              </p>

              <div class="hero-highlights">
                <div class="hero-highlight">
                  <v-icon icon="mdi-wifi" size="18" />
                  <span>Wifi phủ toàn khu</span>
                </div>
                <div class="hero-highlight">
                  <v-icon icon="mdi-shield-check-outline" size="18" />
                  <span>An ninh 24/7</span>
                </div>
                <div class="hero-highlight">
                  <v-icon icon="mdi-book-open-page-variant-outline" size="18" />
                  <span>Khu tự học riêng</span>
                </div>
                <div class="hero-scroll-hint">
                  <span class="hero-scroll-dot"></span>
                  <span class="hero-scroll-text">Cuộn xuống để khám phá</span>
                </div>
              </div>

              <div class="hero-actions">
                <v-btn class="primary-cta" color="primary" rounded="pill" size="large" to="/register">
                  Tìm hiểu ngay
                </v-btn>
                <v-btn class="secondary-cta secondary-cta-light" rounded="pill" size="large" variant="text" to="/login">
                  Đăng nhập
                </v-btn>
              </div>
            </div>

            <div class="hero-visual-info reveal-delay-1" data-reveal>
              <div class="hero-visual-tag">Khu nội trú trung tâm</div>
              <div class="hero-visual-title">Không gian sống đồng bộ, an toàn và hiện đại cho sinh viên</div>
            </div>
          </div>
        </div>

        <div class="showcase-shell status-strip reveal-delay-2" data-reveal>
          <div class="status-label">Trạng thái KTX </div>
          <div class="status-marquee">
            <div class="status-track">
              <span class="status-item">Tòa A còn chỗ</span>
              <span class="status-separator">•</span>
              <span class="status-item">Tòa B Đầy</span>
              <span class="status-separator">•</span>
              <span class="status-item">Tòa C Còn chỗ</span>
              <span class="status-separator">•</span>
              <span class="status-item">Tòa A còn chỗ</span>
              <span class="status-separator">•</span>
              <span class="status-item">Tòa B Đầy</span>
              <span class="status-separator">•</span>
              <span class="status-item">Tòa C Còn chỗ</span>
            </div>
          </div>
          <div class="status-time">Cập nhật ngày 15/6/2026 </div>
        </div>
      </section>

      <section class="content-section reveal-block">
        <div class="showcase-shell">
          <div class="section-title" data-reveal>Không gian nổi bật</div>
          <div class="gallery-grid">
            <article class="gallery-card" data-reveal>
              <img :src="mediaLinks.campusImage" alt="Khu nhà ở sinh viên" class="gallery-photo" :data-fallback="mediaLinks.roomImage" @error="handleImageError" />
              <div class="gallery-content">
                <div class="gallery-kicker">Không gian nổi bật</div>
                <h3>Khu nhà ở sinh viên khang trang</h3>
                <p>Khu nội trú sạch sẽ, đầy đủ tiện ích cơ bản, khu sinh hoạt chung và khu học tập riêng.</p>
              </div>
            </article>

            <article class="gallery-card reveal-delay-1" data-reveal>
              <img :src="mediaLinks.roomImage" alt="Phòng tiêu chuẩn" class="gallery-photo" :data-fallback="mediaLinks.studyImage" @error="handleImageError" />
              <div class="gallery-content">
                <div class="gallery-kicker">Phòng ở</div>
                <h3>Phòng tiêu chuẩn</h3>
                <p>4 người, tiện nghi đầy đủ, phù hợp cho sinh viên cần không gian ổn định.</p>
              </div>
            </article>

            <article class="gallery-card reveal-delay-2" data-reveal>
              <img :src="mediaLinks.studyImage" alt="Khu học tập" class="gallery-photo" :data-fallback="mediaLinks.roomImage" @error="handleImageError" />
              <div class="gallery-content">
                <div class="gallery-kicker">Học tập</div>
                <h3>Khu tự học yên tĩnh</h3>
                <p>Không gian học tập riêng, ánh sáng tốt và phù hợp cho việc tự học buổi tối.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="gioi-thieu" class="content-section reveal-block">
        <div class="showcase-shell">
          <div class="section-title" data-reveal>Hệ thống KTX hiện đại</div>

          <div class="feature-grid">
            <article class="feature-card" data-reveal>
              <div class="feature-icon">
                <v-icon icon="mdi-bed-outline" size="34" />
              </div>
              <h3>Dịch vụ phòng ở</h3>
              <p>Xem tòa nhà, loại phòng, số chỗ trống và thông tin nội trú theo thời gian thực.</p>
            </article>

            <article class="feature-card reveal-delay-1" data-reveal>
              <div class="feature-icon">
                <v-icon icon="mdi-account-school-outline" size="34" />
              </div>
              <h3>Quản lý sinh viên</h3>
              <p>Đăng ký ở nội trú, theo dõi hồ sơ, cập nhật thông tin cá nhân và tiến độ xét duyệt.</p>
            </article>

            <article class="feature-card reveal-delay-2" data-reveal>
              <div class="feature-icon">
                <v-icon icon="mdi-file-document-outline" size="34" />
              </div>
              <h3>Hóa đơn và hỗ trợ</h3>
              <p>Theo dõi hóa đơn, thanh toán, gửi yêu cầu hỗ trợ và nhận thông báo nội bộ.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="content-section reveal-block">
        <div class="showcase-shell">
          <div class="section-title" data-reveal>Tiện ích nội trú nổi bật</div>

          <div class="amenity-grid">
            <article class="amenity-card" data-reveal>
              <div class="amenity-icon">
                <v-icon icon="mdi-wifi" size="26" />
              </div>
              <div>
                <h3>Wifi tốc độ cao</h3>
                <p>Kết nối ổn định tại phòng ở, khu học tập và không gian sinh hoạt chung.</p>
              </div>
            </article>

            <article class="amenity-card reveal-delay-1" data-reveal>
              <div class="amenity-icon">
                <v-icon icon="mdi-security" size="26" />
              </div>
              <div>
                <h3>An ninh nội khu</h3>
                <p>Giám sát khu nội trú xuyên suốt với quy trình ra vào rõ ràng cho sinh viên.</p>
              </div>
            </article>

            <article class="amenity-card reveal-delay-2" data-reveal>
              <div class="amenity-icon">
                <v-icon icon="mdi-silverware-fork-knife" size="26" />
              </div>
              <div>
                <h3>Khu dịch vụ sinh hoạt</h3>
                <p>Bố trí khu ăn uống, sinh hoạt chung và các tiện ích cơ bản gần khu phòng ở.</p>
              </div>
            </article>

            <article class="amenity-card reveal-delay-3" data-reveal>
              <div class="amenity-icon">
                <v-icon icon="mdi-tools" size="26" />
              </div>
              <div>
                <h3>Hỗ trợ bảo trì nhanh</h3>
                <p>Gửi yêu cầu trực tuyến và theo dõi tiến độ xử lý ngay trên hệ thống nội trú.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="content-section content-section-soft reveal-block">
        <div class="showcase-shell">
          <div class="section-title" data-reveal>Số liệu nổi bật</div>

          <div class="stats-grid">
            <div class="stat-card" data-reveal>
              <div class="stat-value">3</div>
              <div class="stat-label">Tòa nhà</div>
            </div>
            <div class="stat-card reveal-delay-1" data-reveal>
              <div class="stat-value">150</div>
              <div class="stat-label">Phòng trống</div>
            </div>
            <div class="stat-card reveal-delay-2" data-reveal>
              <div class="stat-value">1200</div>
              <div class="stat-label">Sinh viên</div>
            </div>
            <div class="stat-card reveal-delay-3" data-reveal>
              <div class="stat-value">4</div>
              <div class="stat-label">Loại phòng</div>
            </div>
          </div>
        </div>
      </section>

      <section id="loai-phong" class="content-section reveal-block">
        <div class="showcase-shell">
          <div class="section-title" data-reveal>Khám phá loại phòng</div>

          <div class="room-grid-toolbar" data-reveal>
            <div class="room-grid-controls">
              <v-btn
                icon="mdi-chevron-left"
                variant="tonal"
                color="primary"
                rounded="circle"
                @click="showPreviousRoomPage"
              />
              <v-btn
                icon="mdi-chevron-right"
                variant="tonal"
                color="primary"
                rounded="circle"
                @click="showNextRoomPage"
              />
            </div>
          </div>

          <div class="room-grid">
            <article v-for="(roomCard, index) in visibleRoomCards" :key="`${roomCard.id}-${currentRoomPage}`" class="room-card" :class="index > 0 ? `reveal-delay-${index}` : ''" data-reveal>
              <div class="room-thumb">
                <img :src="roomCard.imageUrl" :alt="roomCard.title" class="room-thumb-image" :data-fallback="mediaLinks.roomImage" @error="handleImageError" />
                <div class="room-thumb-badge">{{ roomCard.badge }}</div>
              </div>
              <div class="room-body">
                <h3>{{ roomCard.title }}</h3>
                <p>{{ roomCard.description }}</p>
                <div class="room-meta">
                  <span>{{ roomCard.capacity }}</span>
                  <span>{{ roomCard.price }}</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="content-section reveal-block">
        <div class="showcase-shell experience-layout" data-reveal>
          <div class="experience-copy">
            <div class="section-mini">Trải nghiệm nội trú</div>
            <h2>Không gian sống và học tập được thiết kế để sinh viên an tâm trong suốt năm học</h2>
            <p>
              Ký túc xá Đại Nam hướng tới trải nghiệm cân bằng giữa học tập, sinh hoạt và kết nối cộng đồng. Từ khu ở,
              khu tự học đến hệ thống quản lý nội trú đều được tối ưu để thuận tiện cho sinh viên.
            </p>

            <div class="experience-points">
              <div class="experience-point">
                <v-icon icon="mdi-check-circle-outline" size="20" />
                <span>An ninh và giám sát 24/7</span>
              </div>
              <div class="experience-point">
                <v-icon icon="mdi-check-circle-outline" size="20" />
                <span>Thông báo nội trú tập trung qua hệ thống</span>
              </div>
              <div class="experience-point">
                <v-icon icon="mdi-check-circle-outline" size="20" />
                <span>Hỗ trợ đăng ký, hợp đồng và thanh toán trực tuyến</span>
              </div>
            </div>
          </div>

          <div class="experience-visual-card reveal-delay-1" data-reveal>
            <img :src="mediaLinks.experienceMain" alt="Không gian nội trú" class="experience-photo-main" :data-fallback="mediaLinks.roomImage" @error="handleImageError" />
            <div class="experience-overlay-card experience-overlay-top">
              <img :src="mediaLinks.experienceTop" alt="Không gian sinh hoạt" class="experience-overlay-photo" :data-fallback="mediaLinks.roomImage" @error="handleImageError" />
            </div>
            <div class="experience-overlay-card experience-overlay-bottom">
              <img :src="mediaLinks.experienceBottom" alt="Không gian học tập" class="experience-overlay-photo" :data-fallback="mediaLinks.studyImage" @error="handleImageError" />
            </div>
          </div>
        </div>
      </section>

      <section id="huong-dan" class="content-section content-section-soft reveal-block">
        <div class="showcase-shell">
          <div class="section-title" data-reveal>Hướng dẫn đăng ký nội trú</div>

          <div class="guide-layout">
            <div class="guide-panel" data-reveal>
              <div class="guide-heading">Các bước dành cho sinh viên</div>
              <div class="guide-steps">
                <div class="guide-step">
                  <div class="guide-step-number">1</div>
                  <div>
                    <h4>Tạo tài khoản</h4>
                    <p>Đăng ký tài khoản người dùng bằng email và thông tin cơ bản của sinh viên.</p>
                  </div>
                </div>
                <div class="guide-step">
                  <div class="guide-step-number">2</div>
                  <div>
                    <h4>Chọn loại phòng</h4>
                    <p>Xem danh sách phòng còn chỗ, so sánh loại phòng và chi phí phù hợp.</p>
                  </div>
                </div>
                <div class="guide-step">
                  <div class="guide-step-number">3</div>
                  <div>
                    <h4>Nộp hồ sơ đăng ký</h4>
                    <p>Điền thông tin, gửi yêu cầu đăng ký và theo dõi trạng thái xét duyệt trực tuyến.</p>
                  </div>
                </div>
                <div class="guide-step">
                  <div class="guide-step-number">4</div>
                  <div>
                    <h4>Nhận phòng và thanh toán</h4>
                    <p>Hoàn tất hợp đồng, thanh toán các khoản cần thiết và bắt đầu nội trú.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="guide-side">
              <article class="guide-info-card reveal-delay-1" data-reveal>
                <div class="guide-info-kicker">Tài khoản người dùng</div>
                <h3>Dành cho sinh viên</h3>
                <p>
                  Dùng để đăng ký phòng, xem hợp đồng, theo dõi hóa đơn, gửi yêu cầu hỗ trợ và cập nhật hồ sơ cá nhân.
                </p>
              </article>

              <article class="guide-info-card reveal-delay-2" data-reveal>
                <div class="guide-info-kicker">Tài khoản quản trị viên</div>
                <h3>Dành cho ban quản lý</h3>
                <p>
                  Dùng để quản lý phòng, duyệt đăng ký, theo dõi nội trú, xử lý hóa đơn và hỗ trợ vận hành ký túc xá.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="thong-bao" class="content-section reveal-block">
        <div class="showcase-shell">
          <div class="section-title" data-reveal>Thông báo & tin tức</div>

          <div class="news-grid">
            <article class="news-card news-card-main" data-reveal>
              <div class="news-tag">Thông báo mới</div>
              <h3>Mở đợt đăng ký nội trú học kỳ mới từ ngày 20/06</h3>
              <p>
                Sinh viên có thể tạo tài khoản, hoàn thiện hồ sơ và chọn loại phòng trực tiếp trên hệ thống. Kết quả
                xét duyệt sẽ được cập nhật theo từng đợt.
              </p>
            </article>

            <article class="news-card reveal-delay-1" data-reveal>
              <div class="news-tag">Cập nhật vận hành</div>
              <h3>Bổ sung khu tự học buổi tối tại tòa C</h3>
              <p>Khu học tập mở cửa đến 22:30 với wifi ổn định, không gian yên tĩnh và bàn học mới.</p>
            </article>

            <article class="news-card reveal-delay-2" data-reveal>
              <div class="news-tag">Hướng dẫn</div>
              <h3>Quy trình thanh toán nội trú trực tuyến</h3>
              <p>Người dùng có thể kiểm tra hóa đơn và thanh toán ngay sau khi hồ sơ được xác nhận thành công.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="content-section content-section-soft reveal-block">
        <div class="showcase-shell">
          <div class="section-title" data-reveal>Câu hỏi thường gặp</div>

          <div class="faq-grid">
            <article class="faq-card" data-reveal>
              <h3>Khi nào sinh viên có thể đăng ký nội trú?</h3>
              <p>Sinh viên có thể đăng ký theo từng đợt mà nhà trường công bố trên hệ thống và tại mục thông báo.</p>
            </article>

            <article class="faq-card reveal-delay-1" data-reveal>
              <h3>Nếu phòng đã đầy thì có được chuyển sang loại phòng khác không?</h3>
              <p>Có. Hệ thống sẽ hiển thị các phương án còn chỗ để sinh viên lựa chọn phù hợp trong cùng đợt đăng ký.</p>
            </article>

            <article class="faq-card reveal-delay-2" data-reveal>
              <h3>Ban quản lý xử lý yêu cầu hỗ trợ ở đâu?</h3>
              <p>Quản trị viên tiếp nhận và xử lý trực tiếp trong khu vực quản lý nội trú sau khi đăng nhập hệ thống.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="content-section reveal-block">
        <div class="showcase-shell support-layout">
          <div class="support-panel" data-reveal>
            <div class="section-mini">Liên hệ nhanh</div>
            <h2>Ban quản lý luôn sẵn sàng hỗ trợ sinh viên và phụ huynh</h2>
            <p>
              Nếu cần tư vấn về quy trình nội trú, loại phòng phù hợp, lịch đăng ký hoặc hỗ trợ kỹ thuật tài khoản,
              sinh viên có thể liên hệ trực tiếp qua các kênh bên dưới.
            </p>

            <div class="support-items">
              <div class="support-item">
                <v-icon icon="mdi-phone-outline" size="20" />
                <span>Hotline hỗ trợ: 024 3888 6868</span>
              </div>
              <div class="support-item">
                <v-icon icon="mdi-email-outline" size="20" />
                <span>Email: hotro.ktx@dainam.edu.vn</span>
              </div>
              <div class="support-item">
                <v-icon icon="mdi-map-marker-outline" size="20" />
                <span>Khu nội trú Đại Nam, Hà Nội</span>
              </div>
            </div>
          </div>

          <div class="support-side">
            <article class="support-card reveal-delay-1" data-reveal>
              <div class="support-card-kicker">Lịch trực</div>
              <h3>Thứ 2 - Chủ nhật</h3>
              <p>07:30 - 21:30 cho đăng ký, hỗ trợ hồ sơ, xác nhận thanh toán và giải đáp nội trú.</p>
            </article>

            <article class="support-card reveal-delay-2" data-reveal>
              <div class="support-card-kicker">Đối tượng sử dụng</div>
              <h3>Sinh viên và quản trị viên</h3>
              <p>Mỗi nhóm người dùng có khu vực thao tác riêng nhưng vẫn dùng chung một nền tảng quản lý tập trung.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="tin-tuc" class="content-section reveal-block">
        <div class="showcase-shell cta-panel">
          <div>
            <div class="cta-title">Sẵn sàng bắt đầu hành trình nội trú?</div>
            <p class="cta-text">
              Tạo tài khoản người dùng để đăng ký phòng, hoặc đăng nhập tài khoản quản trị viên để quản lý hệ thống.
            </p>
          </div>

          <div class="cta-actions">
            <v-btn class="primary-cta" color="primary" rounded="pill" size="large" to="/register">
              Tạo tài khoản
            </v-btn>
            <v-btn class="secondary-cta secondary-cta-dark" rounded="pill" size="large" variant="text" to="/login">
              Đăng nhập ngay
            </v-btn>
          </div>
        </div>
      </section>

      <footer class="showcase-footer">
        <div class="showcase-shell footer-row">
          <div>
            <div class="footer-brand">KTX Đại Nam</div>
            <div class="footer-copy">Môi trường sống hiện đại cho sinh viên đại học.</div>
          </div>

          <div class="footer-links">
            <a href="#gioi-thieu">Giới thiệu</a>
            <a href="#loai-phong">Loại phòng</a>
            <a href="#huong-dan">Hướng dẫn</a>
            <a href="#thong-bao">Thông báo</a>
          </div>

          <div class="footer-copy">© 2026 Qly_ktx Dormitory Platform.</div>
        </div>
      </footer>
    </v-main>
  </v-app>
</template>

<style scoped src="/src/core/views/IntroView.css"></style>
