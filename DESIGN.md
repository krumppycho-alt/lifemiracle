# Design System: Insaeng Jabwajom Night Version

**Project ID:** 12523619000707258420

## 1. Visual Theme & Atmosphere

'나미야 잡화점의 기적'에서 영감을 받은 오프라인 빈티지 로또 판매점의 **심야(Night) 버전**입니다. 어둡고 묵직한 밤공기 속에 따뜻하게 새어 나오는 불빛(Neon/Spotlight)이 메인 테마입니다. '신비로움', '따뜻함', '아날로그 향수'를 자아내기 위해 짙은 우드(Wood) 텍스처와 빛바랜 종이(Paper) 텍스처를 겹겹이 쌓아 올려 아늑하면서도 밀도 있는(Dense) 공간감을 연출합니다.

## 2. Color Palette & Roles

- **Deep Night Background (#1a140e)**: 전체 화면을 감싸는 밤하늘과 어두운 목재 느낌의 가장 깊은 배경색.
- **Vintage Storefront Window (rgba(26, 20, 14, 0.85))**: 콘텐츠를 담는 메인 컨테이너 영역의 반투명한 암갈색. 심도 있는 글래스모피즘(Blur) 효과와 결합되어 내부를 아늑하게 만듭니다.
- **Miracle Amber (#ee9d2b)**: 핵심 포인트(Accent) 컬러. 네온사인, 버튼 배경, 중요 텍스트(숫자, 타이틀)에 사용되며 어둠 속에서 밝게 빛나는 따뜻한 백열등 불빛을 상징합니다.
- **Faded Paper White (#f4ede1)**: 서브 콘텐츠(기록들, 책갈피 메뉴)의 배경으로 사용되는 빛바랜 종이 색상. 눈이 편안하고 아날로그적인 감성을 부여합니다.
- **Moonlight Text (#f8f7f6)**: 가장 밝은 기본 텍스트 텍스트 컬러로, 정보 전달의 명확성을 담당합니다.
- **Muted Starlight (#cbd5e1)**: 서브 텍스트 및 부가 설명을 위한 차분한 쿨톤 회색.

## 3. Typography Rules

- **Primary Display (Space Grotesk)**: 헤딩, 타이틀, 그리고 로또 숫자에 사용됩니다. 디지털하면서도 기하학적인 형태가 네온사인 감성과 잘 맞아떨어지며, 숫자의 시인성이 매우 높습니다. Weight는 600~700(Bold) 사용.
- **Secondary / Body (Pretendard)**: 한글 가독성을 위한 기본 폰트로 사용되며, 본문 내용이나 부가 설명에 주로 사용됩니다.
- **Handwriting (Nanum Pen Script)**: 사용자들의 제보나 익명 사연표시 등 감성적인 부분에 부분적으로 사용됩니다.

## 4. Component Stylings

- **Buttons:**
  - **모양:** 알약 형태의 완전한 곡률(Pill-shaped, `border-radius: 9999px`)을 가집니다.
  - **색상 & 스타일:** 짙은 배경과 대비를 이루도록 Miracle Amber(#ee9d2b)를 배경으로 사용하며, Hover 시 살짝 축소(`scale(0.98)`)되어 물리적인 버튼을 누르는 듯한 쫀득한 느낌을 줍니다. 은은한 Glow 반사광을 가져 입체감을 줍니다.
- **Cards/Containers (Main Window):**
  - **모양:** 부드럽게 둥근 모서리(Generously rounded corners, `border-radius: 1.5rem`).
  - **스타일:** 배경은 반투명한 우드톤(rgba(26,20,14,0.85))이며, `backdrop-filter: blur(8px)`를 통해 뒷배경을 은은하게 비춥니다. 그림자는 매우 깊고 묵직한 Drop shadow를 사용해 둥둥 떠 있는 입체감을 부여합니다.
- **Vintage Wooden Box (Lottery Machine):**
  - **질감:** Wood-texture 이미지 위에 검은색 그라디언트를 덧씌워 질감을 살립니다.
  - **테두리:** 두꺼운 호박색 띠(`border: 4px solid rgba(120, 53, 15, 0.5)`)를 둘러 아날로그 오락기기처럼 단단한 인상을 줍니다.

## 5. Layout Principles

- **Central Focus:** 모든 핵심 인터랙션(간판, 타이틀, 추첨 박스)은 화면 중앙에 오밀조밀하게(Centered) 모여있어 사용자의 시선을 응집시킵니다.
- **Layering & Depth:** 배경 텍스처 -> 메인 글래스 컨테이너 -> 나무 프레임 -> 네온 텍스트 순으로 확실한 Z-index 계층과 그림자(Elevation)를 부여하여 현실 공간에 있는 듯한 심도를 만듭니다.
- **Margins:** 넉넉하고 시원한 여백보다는, 요소들이 적당히 밀집되어 낡고 작은 잡화점의 '포근함'을 연출할 수 있도록 여백을 구성합니다.
