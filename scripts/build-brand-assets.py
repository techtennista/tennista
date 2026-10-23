"""
Generates the static brand assets that Next.js serves from src/app and /public:
favicon, apple icon and the Open Graph share image.

    python3 -m pip install pillow
    python3 scripts/build-brand-assets.py

Re-run whenever the logo or the brand palette changes.
"""

from pathlib import Path


from PIL import Image, ImageDraw, ImageFont

BLUE = (0, 60, 148)
BLUE_DARK = (0, 42, 107)
LIME = (212, 222, 37)
WHITE = (255, 255, 255)

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "src" / "app"
PUBLIC = ROOT / "public"
DISPLAY_FONT = ROOT / "assets/roc-grotesk-font-family (1)/Fontspring-DEMO-rocgroteskcond-black.otf"
BODY_FONT = ROOT / "assets/roc-grotesk-font-family (1)/Fontspring-DEMO-rocgrotesk-medium.otf"


def ball_mark(size: int) -> Image.Image:
    """Blue tile with a lime tennis ball — legible down to 16px."""
    scale = 8
    s = size * scale
    img = Image.new("RGBA", (s, s), BLUE + (255,))
    d = ImageDraw.Draw(img)
    pad = s * 0.14
    d.ellipse([pad, pad, s - pad, s - pad], fill=LIME + (255,))
    seam = max(2, int(s * 0.055))
    d.arc([pad - s * 0.30, pad, s * 0.42, s - pad], start=270, end=90, fill=WHITE, width=seam)
    d.arc([s * 0.58, pad, s - pad + s * 0.30, s - pad], start=90, end=270, fill=WHITE, width=seam)
    return img.resize((size, size), Image.LANCZOS)


def write_icons() -> None:
    ball_mark(512).save(APP / "icon.png")
    ball_mark(180).save(APP / "apple-icon.png")
    ball_mark(256).save(APP / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("✓ icon.png, apple-icon.png, favicon.ico")


def write_og_image() -> None:
    w, h = 1200, 630
    img = Image.new("RGB", (w, h), BLUE)
    d = ImageDraw.Draw(img)

    # Court sweep along the bottom edge — a smooth wave, not a chevron.
    def wave(baseline: float, amplitude: float, phase: float) -> list[tuple[float, float]]:
        from math import pi, sin

        return [(x, baseline + amplitude * sin(2 * pi * x / w + phase)) for x in range(0, w + 1, 8)]

    crest = wave(540, 34, 0.4)
    d.polygon([*crest, (w, h), (0, h)], fill=LIME)
    d.line(wave(578, 30, 0.4), fill=WHITE, width=7, joint="curve")

    # The logo carries a blue bar, so it sits on a white card to stay legible.
    card = (56, 48, 56 + 236, 48 + 164)
    d.rounded_rectangle(card, radius=22, fill=WHITE)
    logo = Image.open(PUBLIC / "tennista-logo.png").convert("RGBA")
    logo.thumbnail((200, 200), Image.LANCZOS)
    img.paste(logo, (card[0] + (236 - logo.width) // 2, card[1] + (164 - logo.height) // 2), logo)

    head = ImageFont.truetype(str(DISPLAY_FONT), 100)
    body = ImageFont.truetype(str(BODY_FONT), 28)

    d.text((60, 258), "EVERY SERVE", font=head, fill=WHITE)
    d.text((60, 352), "STARTS A STORY", font=head, fill=LIME)
    d.text(
        (62, 468),
        "Tennis, education and life skills for young people",
        font=body,
        fill=(206, 224, 248),
    )

    img.save(PUBLIC / "og-image.png", optimize=True)
    print("✓ og-image.png")


write_icons()
write_og_image()
