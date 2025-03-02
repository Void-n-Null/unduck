import { createElement } from "../utils/dom";
import { bangs } from "../bang";
import { filterAndSortBangs, getCombinedBangs } from "../utils/bangUtils";
import { BangItem } from "../types/BangItem";
import { loadSettings } from "../utils/settings";

export interface BangDropdownOptions {
  maxItems?: number;
  maxHeight?: string;
  onSelectBang?: (bangText: string) => void;
  appendTo?: HTMLElement; // Element to append the dropdown to (default: input parent)
  positionStyle?: 'absolute' | 'fixed'; // Positioning style (default: absolute)
  zIndex?: number; // z-index for the dropdown (default: 999)
}

export class BangDropdown {
  private container: HTMLDivElement | null = null;
  private isVisible = false;
  private selectedIndex = -1;
  private inputElement: HTMLInputElement;
  private options: BangDropdownOptions;
  private filteredBangs: BangItem[] = [];
  private documentClickHandler: (e: MouseEvent) => void;
  private tabKeyHandler: (e: KeyboardEvent) => void;
  
  constructor(inputElement: HTMLInputElement, options: BangDropdownOptions = {}) {
    this.inputElement = inputElement;
    this.options = {
      maxItems: 25,
      maxHeight: '30vh',
      ...options
    };
    
    // Setup click handler on document to close dropdown when clicking outside
    this.documentClickHandler = (e: MouseEvent) => {
      if (!this.isVisible) return;
      
      const target = e.target as Node;
      if (
        this.container && 
        !this.container.contains(target) && 
        target !== this.inputElement
      ) {
        this.hide();
      }
    };
    
    // Add Tab key handler to select top option
    this.tabKeyHandler = (e: KeyboardEvent) => {
      if (e.key === "Tab" && this.isVisible && this.filteredBangs.length > 0) {
        e.preventDefault(); // Prevent default tab behavior
        
        // If an item is selected, use that one, otherwise select the first item
        if (this.selectedIndex >= 0) {
          this.selectCurrent();
        } else {
          this.selectTopOption();
        }
      }
    };
    
    // Attach event listeners
    document.addEventListener("click", this.documentClickHandler);
    this.inputElement.addEventListener("keydown", this.tabKeyHandler);
    
    // Add window resize handler for fixed positioning
    if (options.positionStyle === 'fixed' && options.appendTo) {
      window.addEventListener('resize', () => {
        if (this.isVisible && this.container) {
          const rect = this.inputElement.getBoundingClientRect();
          this.container.style.left = `${rect.left}px`;
          this.container.style.width = `${rect.width}px`;
          this.container.style.top = `${rect.bottom + 2}px`;
        }
      });
    }
  }
  
  // Add method to select the top option
  private selectTopOption(): void {
    if (this.filteredBangs.length > 0) {
      this.selectBang(this.filteredBangs[0].t);
    }
  }
  
  public show(query: string): void {
    // Get combined bangs (default + custom)
    const settings = loadSettings();
    const combinedBangs = getCombinedBangs(settings);
    
    // Use the new utility function to filter and sort bangs
    this.filteredBangs = filterAndSortBangs(combinedBangs, query, this.options.maxItems);
    
    if (this.filteredBangs.length === 0) {
      this.hide();
      return;
    }
    
    // Create dropdown container if it doesn't exist
    this.ensureContainer();
    
    if (!this.container) return;
    
    // Clear previous content
    this.container.innerHTML = '';
    this.selectedIndex = -1;
    
    // Create dropdown items
    this.filteredBangs.forEach((bang, index) => {
      const item = this.createBangItem(bang);
      this.container?.appendChild(item);
    });
    
    // Show dropdown with purple gradient background
    if (this.container) {
      // If using fixed positioning, update position based on current input position
      if (this.options.positionStyle === 'fixed' && this.options.appendTo) {
        const rect = this.inputElement.getBoundingClientRect();
        this.container.style.left = `${rect.left}px`;
        this.container.style.width = `${rect.width}px`;
        this.container.style.top = `${rect.bottom + 2}px`; // Adding small offset
      }
      
      this.container.style.display = 'block';
      this.container.style.background = 'linear-gradient(to bottom, rgba(45, 0, 30, 0.9), rgba(0, 0, 0, 0.95))';
      this.isVisible = true;
      
      // Disable interactions with footer elements while dropdown is visible
      this.disableFooterInteractions(true);
    }
  }
  
  public hide(): void {
    if (this.container) {
      this.container.style.display = 'none';
      this.isVisible = false;
      this.selectedIndex = -1;
      
      // Re-enable interactions with footer
      this.disableFooterInteractions(false);
    }
  }
  
  public navigateUp(): void {
    this.navigate(-1);
  }
  
  public navigateDown(): void {
    this.navigate(1);
  }
  
  public selectCurrent(): void {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredBangs.length) {
      this.selectBang(this.filteredBangs[this.selectedIndex].t);
    }
  }
  
  public isDropdownVisible(): boolean {
    return this.isVisible;
  }
  
  private navigate(direction: number): void {
    if (!this.container) return;
    
    const items = this.container.querySelectorAll('div[class*="px-4 py-3"]');
    if (items.length === 0) return;
    
    // Calculate new index
    const newIndex = Math.max(0, Math.min(items.length - 1, this.selectedIndex + direction));
    
    // Remove highlight from previous item
    if (this.selectedIndex >= 0 && this.selectedIndex < items.length) {
      items[this.selectedIndex].classList.remove('bg-[#2a004d]/70');
    }
    
    // Highlight new item
    items[newIndex].classList.add('bg-[#2a004d]/70');
    this.selectedIndex = newIndex;
    
    // Scroll item into view if needed
    (items[newIndex] as HTMLElement).scrollIntoView({
      block: 'nearest',
      behavior: 'smooth'
    });
  }
  
  private createBangItem(bang: BangItem): HTMLDivElement {
    const item = createElement('div', {
      className: 'px-4 py-3 hover:bg-[#2a004d]/70 cursor-pointer flex flex-col border-b border-white/5 last:border-b-0 transition-colors'
    });
    
    // First line: Shortcut and Service name
    const titleRow = createElement('div', {
      className: 'flex items-center justify-between'
    });
    
    const shortcut = createElement('span', {
      className: 'font-mono text-[#3a86ff] font-bold'
    }, [`!${bang.t}`]);
    
    const service = createElement('span', {
      className: 'text-white font-medium'
    }, [bang.s]);
    
    titleRow.append(shortcut, service);
    
    // Second line: Website and Category
    const detailRow = createElement('div', {
      className: 'flex items-center justify-between mt-1 text-sm'
    });
    
    const website = createElement('span', {
      className: 'text-white/60'
    }, [bang.d]);
    
    const category = createElement('span', {
      className: 'text-white/40 text-xs px-2 py-0.5 bg-[#3a86ff]/10 rounded-full'
    }, [`${bang.c}${bang.sc !== bang.c ? ` · ${bang.sc}` : ''}`]);
    
    detailRow.append(website, category);
    
    item.append(titleRow, detailRow);
    
    // Add click event to select the bang
    item.addEventListener('click', () => {
      this.selectBang(bang.t);
    });
    
    return item;
  }
  
  private ensureContainer(): void {
    if (!this.container) {
      const positionStyle = this.options.positionStyle || 'absolute';
      const zIndex = this.options.zIndex || 999;
      
      // Create the container with proper z-index
      this.container = createElement('div', {
        className: `${positionStyle} left-0 right-0 top-full mt-2 bg-black/90 border border-white/10 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent`,
        style: `max-height: ${this.options.maxHeight}; z-index: ${zIndex};`
      });
      
      // Determine where to append the container
      if (this.options.appendTo) {
        // If appendTo is specified, use it
        this.options.appendTo.appendChild(this.container);
        
        // Adjust position based on input element's position
        if (this.options.positionStyle === 'fixed') {
          const rect = this.inputElement.getBoundingClientRect();
          this.container.style.left = `${rect.left}px`;
          this.container.style.right = `${window.innerWidth - rect.right}px`;
          this.container.style.top = `${rect.bottom}px`;
          this.container.style.width = `${rect.width}px`;
        }
      } else {
        // Default behavior - append to parent
        const inputWrapper = this.inputElement.closest('.relative');
        if (inputWrapper) {
          inputWrapper.appendChild(this.container);
        } else {
          // Fallback to adding after input if wrapper not found
          const parent = this.inputElement.parentElement;
          if (parent) {
            parent.appendChild(this.container);
          }
        }
      }
    }
  }
  
  private selectBang(bangText: string): void {
    if (this.options.onSelectBang) {
      this.options.onSelectBang(bangText);
    }
    this.hide();
  }
  
  private disableFooterInteractions(disable: boolean): void {
    // Find the footer element
    const footer = document.querySelector('footer');
    
    if (footer) {
      // Apply styles to disable/enable interactions with footer
      footer.style.pointerEvents = disable ? 'none' : 'auto';
      
      // Apply blur effect to footer when dropdown is visible
      if (disable) {
        footer.classList.add('footer-blurred');
        
        // Add the CSS rule for the blur effect if it doesn't exist yet
        if (!document.getElementById('footer-blur-style')) {
          const style = document.createElement('style');
          style.id = 'footer-blur-style';
          style.textContent = `
            .footer-blurred {
              filter: blur(8px);
              opacity: 0.6;
              transition: filter 0.2s ease, opacity 0.2s ease;
            }
          `;
          document.head.appendChild(style);
        }
      } else {
        footer.classList.remove('footer-blurred');
      }
    }
  }
  
  /**
   * Properly disposes the dropdown and removes all event listeners
   */
  public dispose(): void {
    // Remove global event listeners
    document.removeEventListener("click", this.documentClickHandler);
    
    // Remove input element event listeners
    if (this.inputElement) {
      this.inputElement.removeEventListener("keydown", this.tabKeyHandler);
    }
    
    // Hide and remove the dropdown from DOM
    this.hide();
    
    // Clear references
    this.container = null;
    this.filteredBangs = [];
  }
} 