import { createElement } from "../utils/dom";
import { bangs } from "../bang";
import { 
  loadSettings, 
  saveSettings, 
  updateSetting,
  UserSettings 
} from "../utils/settings";
import { BangItem, filterAndSortBangs } from "../utils/bangUtils";
import { BangDropdown } from "./BangDropdown";

export class SettingsModal {
  private modal: HTMLDivElement | null = null;
  private overlay: HTMLDivElement | null = null;
  private isVisible = false;
  private settings: UserSettings;
  private onSettingsChange: (settings: UserSettings) => void;
  
  // UI elements for default bang setting
  private defaultBangInput: HTMLInputElement | null = null;
  private bangDropdown: BangDropdown | null = null;
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
    
    // Hide the dropdown if visible
    if (this.bangDropdown) {
      this.bangDropdown.hide();
    }
    
    // Apply fade-out animation
    this.overlay.style.opacity = '0';
    if (this.modal) this.modal.style.transform = 'translateY(20px)';
    
    // Remove after animation completes
    setTimeout(() => {
      if (this.overlay && document.body.contains(this.overlay)) {
        document.body.removeChild(this.overlay);
      }
      this.isVisible = false;
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
      // Process the input to find the best match or default to Google
      this.processAndSaveBangSetting();
      
      // Save all settings
      saveSettings(this.settings);
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
   * Process the input and save the best matching bang setting
   * If input is empty, defaults to Google
   */
  private processAndSaveBangSetting(): void {
    if (!this.defaultBangInput) return;
    
    let inputValue = this.defaultBangInput.value.trim();
    console.log("Processing input value:", inputValue);
    
    // If we already have a selected bang item, use it
    if (this.selectedBangItem) {
      console.log("Using selected bang item:", this.selectedBangItem.t);
      this.settings.defaultBang = this.selectedBangItem.t;
      return;
    }
    
    // Handle empty input - default to Google
    if (!inputValue) {
      console.log("Empty input, defaulting to Google");
      const googleBang = bangs.find(b => b.s.toLowerCase() === 'google' && b.t === 'g');
      if (googleBang) {
        this.settings.defaultBang = googleBang.t;
        this.selectedBangItem = googleBang;
        this.defaultBangInput.value = `!${googleBang.t} - ${googleBang.s}`;
      }
      return;
    }
    
    // Remove exclamation point and anything after hyphen or dash
    inputValue = inputValue.replace(/^!/, '').split(/[-–]/)[0].trim();
    console.log("Cleaned input value:", inputValue);
    
    // First try direct match with bang shortcode
    const directMatch = bangs.find(b => b.t.toLowerCase() === inputValue.toLowerCase());
    if (directMatch) {
      console.log("Direct match found:", directMatch.t);
      this.settings.defaultBang = directMatch.t;
      this.selectedBangItem = directMatch;
      this.defaultBangInput.value = `!${directMatch.t} - ${directMatch.s}`;
      return;
    }
    
    // If no direct match, use the filtering logic
    console.log("No direct match, using filter and sort");
    const matchedBangs = filterAndSortBangs(bangs, inputValue, 1);
    console.log("Matched bangs:", matchedBangs.length > 0 ? matchedBangs[0].t : "none");
    
    if (matchedBangs.length > 0) {
      const bestMatch = matchedBangs[0];
      this.settings.defaultBang = bestMatch.t;
      this.selectedBangItem = bestMatch;
      this.defaultBangInput.value = `!${bestMatch.t} - ${bestMatch.s}`;
    } else {
      // If no match found and input is not empty, try to match by service name
      console.log("No filter match, trying service name match");
      const serviceMatch = bangs.find(b => 
        b.s.toLowerCase().includes(inputValue.toLowerCase())
      );
      
      if (serviceMatch) {
        console.log("Service match found:", serviceMatch.t);
        this.settings.defaultBang = serviceMatch.t;
        this.selectedBangItem = serviceMatch;
        this.defaultBangInput.value = `!${serviceMatch.t} - ${serviceMatch.s}`;
      } else {
        // Still no match, default to Google
        console.log("No match found, defaulting to Google");
        const googleBang = bangs.find(b => b.s.toLowerCase() === 'google' && b.t === 'g');
        if (googleBang) {
          this.settings.defaultBang = googleBang.t;
          this.selectedBangItem = googleBang;
          this.defaultBangInput.value = `!${googleBang.t} - ${googleBang.s}`;
        }
      }
    }
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
        
        // Hide dropdown if visible
        if (this.bangDropdown) {
          this.bangDropdown.hide();
        }
      }
    });
    
    // Append elements to input wrapper
    inputWrapper.append(this.defaultBangInput, clearButton);
    section.append(label, description, inputWrapper);
    
    // Initialize the BangDropdown component
    if (this.defaultBangInput) {
      this.bangDropdown = new BangDropdown(this.defaultBangInput, {
        maxItems: 10,
        maxHeight: '35vh',
        onSelectBang: (bangText) => this.handleBangSelection(bangText),
        appendTo: document.body,
        positionStyle: 'fixed',
        zIndex: 1000
      });
      
      // Add input event handler for showing dropdown and real-time matching
      this.defaultBangInput.addEventListener('input', () => {
        const query = this.defaultBangInput?.value.toLowerCase().replace(/^!/, '') || '';
        
        // Try to match the current input and update selectedBangItem in real-time
        // This ensures even if the user doesn't select from dropdown, we capture their intent
        if (query.length > 0) {
          const directMatch = bangs.find(b => b.t.toLowerCase() === query);
          if (directMatch) {
            this.selectedBangItem = directMatch;
          }
        }
        
        // Skip showing dropdown if query is too short and we already have a selection
        if (query.length < 1 && this.selectedBangItem) {
          if (this.bangDropdown) {
            this.bangDropdown.hide();
          }
          return;
        }
        
        if (this.bangDropdown) {
          this.bangDropdown.show(query);
        }
      });
      
      // Add focus event handler
      this.defaultBangInput.addEventListener('focus', () => {
        const query = this.defaultBangInput?.value.toLowerCase().replace(/^!/, '') || '';
        if (query.length > 0 || !this.selectedBangItem) {
          if (this.bangDropdown) {
            this.bangDropdown.show(query);
          }
        }
      });
    }
    
    return section;
  }
  
  /**
   * Handles bang selection from dropdown
   */
  private handleBangSelection(bangText: string): void {
    const matchingBang = bangs.find(b => b.t === bangText);
    if (matchingBang && this.defaultBangInput) {
      this.defaultBangInput.value = `!${matchingBang.t} - ${matchingBang.s}`;
      this.selectedBangItem = matchingBang;
      this.settings.defaultBang = matchingBang.t;
    }
  }
} 
