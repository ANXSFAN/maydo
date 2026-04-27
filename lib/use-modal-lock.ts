import { useEffect, useRef } from "react";

/**
 * 模态打开期间锁定 body 滚动并支持 ESC 关闭。
 * Why: 之前所有模态背景仍可滚动，且键盘用户无法关闭。
 */
export function useModalLock(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
}
