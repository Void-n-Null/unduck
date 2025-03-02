import { createElement } from "../utils/dom";
import { bangs } from "../bang";
import { 
  loadSettings, 
  saveSettings, 
  updateSetting,
  UserSettings 
} from "../utils/settings";
import { BangItem } from "../utils/bangUtils";

export class SettingsModal {
  private modal: HTMLDivElement | null = null;
  private overlay: HTMLDivElement | null = null;
  private isVisible = false;
  private settings: UserSettings;
  private onSettingsChange: (settings: UserSettings) => void;
  
  // UI elements for default bang setting
  private defaultBangInput: HTMLInputElement | null = null;
  private defaultBangDropdown: HTMLDivElement | null = null;
  private selectedBangItem: BangItem | null = null;
  
  // Define the handleEscKey method earlier to fix reference errors
  private handleEscKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.isVisible) {
      this.hide();
    }
  };
  
  constructor(onSettingsChange: (settings: UserSettings) => void = () => {}) {
    this.settings = loadSettings();
    this.onSettingsChange = onSettingsChange;
  }
  
  /**
   * Creates and shows the settings modal
   */
  public show(): void {
    this.createModal();
    this.isVisible = true;
    
    // Add modal to body if not already present
    if (this.overlay && !document.body.contains(this.overlay)) {
      document.body.appendChild(this.overlay);
    }
    
    // Apply fade-in animation
    setTimeout(() => {
      if (this.overlay) this.overlay.style.opacity = '1';
      if (this.modal) this.modal.style.transform = 'translateY(0)';
    }, 50);
    
    // Add ESC key handler
    document.addEventListener('keydown', this.handleEscKey);
  }
  
  /**
   * Hides and removes the settings modal
   */
  public hide(): void {
    if (!this.overlay) return;
    
    // Hide the dropdown first
    this.hideBangDropdown();
    
    // Apply fade-out animation
    this.overlay.style.opacity = '0';
    if (this.modal) this.modal.style.transform = 'translateY(20px)';
    
    // Remove after animation completes
    setTimeout(() => {
      if (this.overlay && document.body.contains(this.overlay)) {
        document.body.removeChild(this.overlay);
      }
      this.isVisible = false;
      
      // Clean up the dropdown when hiding the modal
      this.cleanup();
    }, 300);
    
    // Remove ESC key handler
    document.removeEventListener('keydown', this.handleEscKey);
  }
  
  /**
   * Toggles the visibility of the settings modal
   */
  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  /**
   * Checks if the modal is currently visible
   */
  public isModalVisible(): boolean {
    return this.isVisible;
  }
  
  /**
   * Creates the modal elements if they don't exist
   */
  private createModal(): void {
    if (this.modal) return;
    
    // Create overlay
    this.overlay = createElement('div', {
      className: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300',
      style: 'opacity: 0;'
    });
    
    // Create modal
    this.modal = createElement('div', {
      className: 'bg-[#120821] border border-white/10 rounded-lg shadow-xl w-full max-w-md overflow-hidden transition-transform duration-300',
      style: 'transform: translateY(20px);'
    });
    
    // Modal header
    const header = createElement('div', {
      className: 'bg-gradient-to-r from-[#2a004d] to-[#1a0036] px-6 py-4 flex justify-between items-center'
    });
    
    const title = createElement('h2', {
      className: 'text-white text-xl font-bold'
    }, ['Settings']);
    
    const closeButton = createElement('button', {
      className: 'text-white/80 hover:text-white transition-colors'
    }, ['×']);
    closeButton.addEventListener('click', () => this.hide());
    
    header.append(title, closeButton);
    
    // Modal content
    const content = createElement('div', {
      className: 'px-6 py-4'
    });
    
    // Default bang setting
    const defaultBangSection = this.createDefaultBangSetting();
    content.appendChild(defaultBangSection);
    
    // Add more settings here as needed
    
    // Modal footer
    const footer = createElement('div', {
      className: 'bg-black/30 px-6 py-4 flex justify-end'
    });
    
    const saveButton = createElement('button', {
      className: 'bg-[#3a86ff] hover:bg-[#2a76ef] text-white px-4 py-2 rounded transition-colors',
      type: 'button'
    }, ['Save Settings']);
    saveButton.addEventListener('click', () => {
      saveSettings(this.settings);
      // Save default bang to local storage if set
      if (this.settings.defaultBang) {
        localStorage.setItem('defaultBang', this.settings.defaultBang);
      } else {
        localStorage.removeItem('defaultBang'); // Remove if not set to fall back on default
      }

      this.onSettingsChange(this.settings);
      this.hide();
    });
    
    footer.appendChild(saveButton);
    
    // Assemble modal
    this.modal.append(header, content, footer);
    this.overlay.appendChild(this.modal);
    
    // Close when clicking overlay (not the modal itself)
    this.overlay.addEventListener('click', (e: MouseEvent) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });
  }
  
  /**
   * Creates the UI for setting a default bang
   */
  private createDefaultBangSetting(): HTMLDivElement {
    const section = createElement('div', {
      className: 'mb-4'
    });
    
    const label = createElement('label', {
      className: 'block text-white text-sm font-medium mb-2'
    }, ['Default Bang']);
    
    const description = createElement('p', {
      className: 'text-white/70 text-sm mb-3'
    }, ['When set, this bang will be used automatically if you search without specifying a bang.']);

    // Create input wrapper for relative positioning
    const inputWrapper = createElement('div', {
      className: 'relative mb-2'
    });
    
    // Create the text input for bang search
    this.defaultBangInput = createElement('input', {
      type: 'text',
      placeholder: 'Type to search (e.g., "google" or "g")',
      className: 'w-full px-4 py-3 bg-black/20 backdrop-blur-sm hover:bg-black/30 placeholder-white/50 rounded-xl border border-white/10 focus:border-[#3a86ff]/50 focus:bg-black/40 focus:outline-none transition-all text-white',
      autocomplete: 'off',
      spellcheck: 'false'
    });
    
    // Display the current default bang if set
    if (this.settings.defaultBang) {
      const matchingBang = bangs.find(b => b.t === this.settings.defaultBang);
      if (matchingBang) {
        this.defaultBangInput.value = `!${matchingBang.t} - ${matchingBang.s}`;
        this.selectedBangItem = matchingBang;
      }
    }
    
    // Create dropdown container (hidden initially)
    this.defaultBangDropdown = createElement('div', {
      className: 'fixed z-[1001] bg-black/90 border border-white/10 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-y-auto max-h-60 hidden scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent',
      style: 'background: linear-gradient(to bottom, rgba(45, 0, 30, 0.9), rgba(0, 0, 0, 0.95));'
    });
    
    // Append the dropdown to the document body instead
    document.body.appendChild(this.defaultBangDropdown);
    
    // Add input event handler for showing dropdown
    this.defaultBangInput.addEventListener('input', () => {
      this.showBangDropdown();
    });
    
    // Add focus event handler
    this.defaultBangInput.addEventListener('focus', () => {
      this.showBangDropdown();
    });
    
    // Add clear button for removing the default bang
    const clearButton = createElement('button', {
      type: 'button',
      className: 'absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/90 transition-colors'
    }, ['×']);
    
    clearButton.addEventListener('click', () => {
      if (this.defaultBangInput) {
        this.defaultBangInput.value = '';
        this.selectedBangItem = null;
        this.settings.defaultBang = undefined;
        this.hideBangDropdown();
      }
    });
    
    // Add keyboard navigation for dropdown
    this.defaultBangInput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!this.defaultBangDropdown || this.defaultBangDropdown.style.display === 'none') return;
      
      const items = this.defaultBangDropdown.querySelectorAll('.bang-option');
      if (items.length === 0) return;
      
      const highlightedItem = this.defaultBangDropdown.querySelector('.bg-[#2a004d]/70');
      const highlightedIndex = highlightedItem ? Array.from(items).indexOf(highlightedItem) : -1;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.navigateDropdown(highlightedIndex, 1, items);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.navigateDropdown(highlightedIndex, -1, items);
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          if (highlightedItem) {
            (highlightedItem as HTMLElement).click();
          } else if (items.length > 0) {
            (items[0] as HTMLElement).click();
          }
          break;
        case 'Escape':
          this.hideBangDropdown();
          break;
      }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e: MouseEvent) => {
      if (this.defaultBangDropdown && this.defaultBangDropdown.style.display !== 'none') {
        const target = e.target as Node;
        if (
          !this.defaultBangDropdown.contains(target) && 
          target !== this.defaultBangInput
        ) {
          this.hideBangDropdown();
        }
      }
    });
    
    // Append elements to input wrapper - don't append dropdown here anymore
    inputWrapper.append(this.defaultBangInput, clearButton);
    section.append(label, description, inputWrapper);
    
    return section;
  }
  
  /**
   * Shows the bang dropdown with filtered options
   */
  private showBangDropdown(): void {
    if (!this.defaultBangInput || !this.defaultBangDropdown) return;
    
    const query = this.defaultBangInput.value.toLowerCase().replace(/^!/, '');
    
    // Skip if query is too short and we already have a selection
    if (query.length < 1 && this.selectedBangItem) {
      this.hideBangDropdown();
      return;
    }
    
    // Filter and sort bangs based on the query
    const filteredBangs = this.filterAndSortBangs(query);
    
    if (filteredBangs.length === 0) {
      this.hideBangDropdown();
      return;
    }
    
    // Clear previous content
    this.defaultBangDropdown.innerHTML = '';
    
    // Create dropdown items
    filteredBangs.forEach((bang) => {
      const item = this.createBangItem(bang);
      this.defaultBangDropdown?.appendChild(item);
    });
    
    // Position the dropdown based on the input's position
    const inputRect = this.defaultBangInput.getBoundingClientRect();
    this.defaultBangDropdown.style.width = `${inputRect.width}px`;
    this.defaultBangDropdown.style.left = `${inputRect.left}px`;
    this.defaultBangDropdown.style.top = `${inputRect.bottom + 8}px`; // 8px is equivalent to mt-2
    
    // Show dropdown
    this.defaultBangDropdown.style.display = 'block';
  }
  
  /**
   * Filters and sorts bangs based on the query
   */
  private filterAndSortBangs(query: string): BangItem[] {
    // Calculate match scores for each bang
    const withMatchScores = bangs.map(bang => {
      // Full service name match score (prioritized first)
      const serviceName = bang.s.toLowerCase();
      const serviceNameMatch = serviceName.includes(query);
      const isExactServiceMatch = serviceName === query;
      
      // Shortcut match score
      const shortcutName = bang.t.toLowerCase();
      const shortcutMatch = shortcutName.includes(query);
      const isExactShortcutMatch = shortcutName === query;
      
      // Calculate overall match score (lower = better match)
      let matchScore = 100;
      
      if (isExactServiceMatch) {
        matchScore = 0; // Exact service name match is best
      } else if (isExactShortcutMatch) {
        matchScore = 1; // Exact shortcut match is next best
      } else if (serviceNameMatch) {
        // Service name contains query - score based on how close to full match
        matchScore = 2 + (serviceName.length - query.length);
      } else if (shortcutMatch) {
        // Shortcut contains query - slightly lower priority than service name
        matchScore = 10 + (shortcutName.length - query.length);
      } else {
        // No direct match, probably shouldn't show
        matchScore = 1000;
      }
      
      return {
        bang,
        matchScore
      };
    });
    
    // Filter out bad matches
    const goodMatches = withMatchScores.filter(item => item.matchScore < 100);
    
    // Deduplicate by service name, keeping the best match for each service
    const deduplicated: BangItem[] = [];
    const seenServices = new Set<string>();
    
    // Sort by match score before deduplication
    goodMatches.sort((a, b) => a.matchScore - b.matchScore);
    
    for (const item of goodMatches) {
      // Normalize service name for comparison
      const serviceName = item.bang.s.toLowerCase();
      
      // If we haven't seen this service yet, add it
      if (!seenServices.has(serviceName)) {
        seenServices.add(serviceName);
        deduplicated.push(item.bang);
      }
    }
    
    return deduplicated.slice(0, 10); // Limit to 10 results
  }
  
  /**
   * Hides the bang dropdown
   */
  private hideBangDropdown(): void {
    if (this.defaultBangDropdown) {
      this.defaultBangDropdown.style.display = 'none';
    }
  }
  
  /**
   * Creates a bang item for the dropdown
   */
  private createBangItem(bang: BangItem): HTMLDivElement {
    const item = createElement('div', {
      className: 'bang-option px-4 py-3 hover:bg-[#2a004d]/70 cursor-pointer flex flex-col border-b border-white/5 last:border-b-0 transition-colors'
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
    }, [`${bang.c || ''}${bang.sc && bang.sc !== bang.c ? ` · ${bang.sc}` : ''}`]);
    
    detailRow.append(website, category);
    
    item.append(titleRow, detailRow);
    
    // Add click event to select the bang
    item.addEventListener('click', () => {
      if (this.defaultBangInput) {
        this.defaultBangInput.value = `!${bang.t} - ${bang.s}`;
        this.selectedBangItem = bang;
        this.settings.defaultBang = bang.t;
        this.hideBangDropdown();
      }
    });
    
    return item;
  }
  
  /**
   * Handles dropdown navigation
   */
  private navigateDropdown(currentIndex: number, direction: number, items: NodeListOf<Element>): void {
    // Calculate new index
    const newIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));
    
    // Remove highlight from previous item
    if (currentIndex >= 0 && currentIndex < items.length) {
      items[currentIndex].classList.remove('bg-[#2a004d]/70');
    }
    
    // Highlight new item
    items[newIndex].classList.add('bg-[#2a004d]/70');
    
    // Scroll item into view if needed
    (items[newIndex] as HTMLElement).scrollIntoView({
      block: 'nearest',
      behavior: 'smooth'
    });
  }
  
  /**
   * Cleanup method to remove dropdown from DOM when no longer needed
   */
  public cleanup(): void {
    if (this.defaultBangDropdown && document.body.contains(this.defaultBangDropdown)) {
      document.body.removeChild(this.defaultBangDropdown);
    }
  }
} 
