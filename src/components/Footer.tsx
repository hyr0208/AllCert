import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 py-8 bg-white/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by{" "}
            <span className="font-semibold text-gray-700">yyyerin</span>
          </p>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} AllCert. All rights reserved.
          </p>
        </div>
        <p className="text-gray-400 text-xs text-center mt-4">
          * 각 자격증 정보는 해당 기관의 공식 사이트를 참고해 주세요.
        </p>
      </div>
    </footer>
  );
}
