from __future__ import annotations

import argparse
from pathlib import Path
from typing import Tuple

from PIL import Image, ImageDraw, ImageFilter

image_dir = Path(__file__).parent.parent.resolve() / "image"

input_dir = image_dir / "showcase.png"
output_dir = image_dir / "showcase_test.png"


def parse_hex_color(value: str) -> Tuple[int, int, int]:
    value = value.strip().lstrip("#")
    if len(value) != 6:
        raise argparse.ArgumentTypeError("Color must be RRGGBB, e.g. 0d1117")
    try:
        return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))
    except ValueError as exc:
        raise argparse.ArgumentTypeError("Invalid hexadecimal color") from exc


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255
    )
    return mask


def vertical_gradient(
    size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]
) -> Image.Image:
    width, height = size
    image = Image.new("RGBA", size)
    draw = ImageDraw.Draw(image)

    for y in range(height):
        t = y / max(height - 1, 1)
        color = tuple(round(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        draw.line((0, y, width, y), fill=(*color, 255))

    return image


def beautify(
    source: Path,
    destination: Path,
    *,
    max_width: int = 1600,
    outer_padding: int = 72,
    frame_padding: int = 16,
    corner_radius: int = 24,
    border_width: int = 2,
    shadow_blur: int = 34,
    shadow_offset_y: int = 18,
    background_top: tuple[int, int, int] = (20, 27, 36),
    background_bottom: tuple[int, int, int] = (8, 13, 20),
    frame_color: tuple[int, int, int] = (38, 47, 58),
    border_color: tuple[int, int, int] = (112, 126, 142),
) -> None:
    screenshot = Image.open(source).convert("RGBA")

    if max_width > 0 and screenshot.width > max_width:
        ratio = max_width / screenshot.width
        screenshot = screenshot.resize(
            (max_width, round(screenshot.height * ratio)), Image.Resampling.LANCZOS
        )

    frame_width = screenshot.width + 2 * frame_padding
    frame_height = screenshot.height + 2 * frame_padding
    canvas_width = frame_width + 2 * outer_padding
    canvas_height = frame_height + 2 * outer_padding + shadow_offset_y

    canvas = vertical_gradient(
        (canvas_width, canvas_height), background_top, background_bottom
    )

    frame_x = outer_padding
    frame_y = outer_padding

    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        (
            frame_x,
            frame_y + shadow_offset_y,
            frame_x + frame_width,
            frame_y + frame_height + shadow_offset_y,
        ),
        radius=corner_radius + frame_padding,
        fill=(0, 0, 0, 175),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(shadow_blur))
    canvas.alpha_composite(shadow)

    frame = Image.new("RGBA", (frame_width, frame_height), (*frame_color, 255))
    canvas.paste(
        frame,
        (frame_x, frame_y),
        rounded_mask(frame.size, corner_radius + frame_padding),
    )

    border = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(border).rounded_rectangle(
        (frame_x, frame_y, frame_x + frame_width - 1, frame_y + frame_height - 1),
        radius=corner_radius + frame_padding,
        outline=(*border_color, 220),
        width=border_width,
    )
    canvas.alpha_composite(border)

    shot_x = frame_x + frame_padding
    shot_y = frame_y + frame_padding
    canvas.paste(
        screenshot, (shot_x, shot_y), rounded_mask(screenshot.size, corner_radius)
    )

    inner = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(inner).rounded_rectangle(
        (shot_x, shot_y, shot_x + screenshot.width - 1, shot_y + screenshot.height - 1),
        radius=corner_radius,
        outline=(255, 255, 255, 32),
        width=1,
    )
    canvas.alpha_composite(inner)

    destination.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(destination, quality=95)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Create a polished README/Markdown showcase image."
    )
    parser.add_argument("--max-width", type=int, default=1600)
    parser.add_argument("--outer-padding", type=int, default=72)
    parser.add_argument("--frame-padding", type=int, default=16)
    parser.add_argument("--radius", type=int, default=24)
    parser.add_argument("--border-width", type=int, default=2)
    parser.add_argument("--shadow-blur", type=int, default=34)
    parser.add_argument("--shadow-offset-y", type=int, default=18)
    parser.add_argument("--background-top", type=parse_hex_color, default=(20, 27, 36))
    parser.add_argument(
        "--background-bottom", type=parse_hex_color, default=(8, 13, 20)
    )
    parser.add_argument("--frame-color", type=parse_hex_color, default=(38, 47, 58))
    parser.add_argument("--border-color", type=parse_hex_color, default=(112, 126, 142))
    args = parser.parse_args()

    beautify(
        input_dir,
        output_dir,
        max_width=args.max_width,
        outer_padding=args.outer_padding,
        frame_padding=args.frame_padding,
        corner_radius=args.radius,
        border_width=args.border_width,
        shadow_blur=args.shadow_blur,
        shadow_offset_y=args.shadow_offset_y,
        background_top=args.background_top,
        background_bottom=args.background_bottom,
        frame_color=args.frame_color,
        border_color=args.border_color,
    )
    print(f"Saved: {output_dir}")


if __name__ == "__main__":
    main()
