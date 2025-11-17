import { MobileChecker } from './mobile-checker';

export class BaseHelpers {
	static html = document.documentElement;		
	static addTouchClass() {
		if (MobileChecker.isAny) {
			BaseHelpers.html.classList.add('touch');
		}
	}
	static addLoadedClass() {
		window.addEventListener('load', () => {
			setTimeout(() => {
				BaseHelpers.html.classList.add('loaded');
			}, 0);
		});
	}	
	static get getHash() {
		return location.hash?.replace('#', '');
	}
	static calcScrollbarWidth() {
		const scrollbarWidth = (window.innerWidth - document.body.clientWidth) / 16 + 'rem';
		BaseHelpers.html.style.setProperty('--bh-scrollbar-width', scrollbarWidth);
	}
}
