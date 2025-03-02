import { createElement } from "../utils/dom";
import { BangDropdown } from "./BangDropdown";
import { SettingsModal } from "./SettingsModal";
import { loadSettings, UserSettings } from "../utils/settings";
import { getUrlParameters } from "../utils/redirect";
import { CustomBangManager } from "./CustomBangManager";
import { getCombinedBangs } from "../utils/bangUtils";
import { BangItem } from "../types/BangItem";

export class SearchForm {
  private container: HTMLDivElement;
  private form: HTMLFormElement;
  private searchInput: HTMLInputElement;
  private bangDropdown: BangDropdown | null = null;
  private settingsModal: SettingsModal;
  private customBangManager: CustomBangManager;
  private settings: UserSettings;
  private selectedBangItem: any;
  
  constructor() {
    // Load user settings
    this.settings = loadSettings();
    
    // Create search container with Tailwind classes - improved styling
    this.container = createElement('div', { 
      className: 'w-full mt-10 pt-6 border-t border-white/10 relative' 
    });
    
    // Check if this is a recursive query - use custom function for URL parameters
    const urlParams = getUrlParameters();
    const isRecursive = urlParams.get("recursive") === "true";
    const query = urlParams.get("q");
    
    console.log("SearchForm constructor - Is Recursive:", isRecursive, "Query:", query);
    
    // Create a heading that shows when in recursive mode and normal mode
    const searchHeading = createElement('h2', {
      className: 'mb-6 text-white text-2xl font-light text-center tracking-wider',
    }, [isRecursive ? 'Processing recursive search...' : 'Search with !Bangs']);
    
    // Create buttons container for action buttons
    const buttonsContainer = createElement('div', {
      className: 'flex items-center gap-2'
    });
    
    // Add custom bangs button
    const customBangsButton = createElement('button', {
      className: 'text-white/50 hover:text-white/90 transition-colors px-3 py-1 rounded-full hover:bg-white/10 flex items-center'
    }, [
      'My Bangs',
      createElement('span', { className: 'ml-1' }, ['+'])
    ]);
    
    // Initialize custom bang manager
    this.customBangManager = new CustomBangManager((newSettings) => {
      // Update local settings when custom bangs change
      this.settings = newSettings;
      
      // Re-initialize bang dropdown when settings change
      // This ensures the dropdown works properly after deleting a custom bang
      this.reinitializeBangDropdown();
    });
    
    // Add click event for custom bangs button
    customBangsButton.addEventListener('click', () => {
      this.customBangManager.show();
    });
    
    // Add settings gear icon
    const settingsIcon = createElement('button', {
      className: 'text-white/50 hover:text-white/90 transition-colors w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10'
    });
    
    // Add settings icon image
    const settingsImg = createElement('img', {
      src: '/settings.png',
      alt: 'Settings',
      className: 'w-10 h-10 opacity-80 hover:opacity-100 transition-opacity'
    });
    
    settingsIcon.appendChild(settingsImg);
    
    // Initialize settings modal
    this.settingsModal = new SettingsModal((newSettings) => {
      // Update local settings when modal settings change
      this.settings = newSettings;
    });
    
    // Add click event for settings icon
    settingsIcon.addEventListener('click', () => {
      this.settingsModal.toggle();
    });
    
    // Add buttons to container
    buttonsContainer.append(customBangsButton, settingsIcon);
    
    // Add buttons container to heading
    searchHeading.appendChild(buttonsContainer);
    
    // Create search form with Tailwind classes - integrated design
    this.form = createElement('form', { 
      id: 'search-form', 
      className: 'flex flex-col mt-4 mb-4' 
    });
    
    // Create input wrapper with integrated search button
    const inputWrapper = createElement('div', {
      className: 'relative w-full'
    });
    
    // Create clickable ReBang logo on the right that acts as a submit button
    const searchButton = createElement('button', {
      type: 'submit',
      className: 'absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-transparent hover:scale-110 active:scale-95 transition-all outline-none focus:outline-none focus:ring-0 z-10'
    });
    
    // Add the ReBang logo with shadow and no background
    const logoImg = createElement('img', {
      src: '/ReBangLogo.png', // Using PNG for transparency
      alt: 'Search',
      style: 'transform: rotate(-60deg)',
      className: 'w-8 h-8 filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]'
    });
    
    searchButton.appendChild(logoImg);
    
    // Create search input with Tailwind classes - adjusted padding for right logo
    this.searchInput = createElement('input', {
      type: 'text',
      placeholder: 'Type your search query or !bang search',
      className: 'w-full px-4 py-3 pr-14 bg-black/20 backdrop-blur-sm hover:bg-black/30 placeholder-white/50 rounded-xl border border-white/10 focus:border-[#3a86ff]/50 focus:bg-black/40 focus:outline-none transition-all text-white shadow-lg',
      autocomplete: 'off',
      spellcheck: 'false',
      autocapitalize: 'off'
    });
    
    // Initialize the bang dropdown early
    this.bangDropdown = new BangDropdown(this.searchInput, {
      onSelectBang: (bangText) => this.handleBangSelection(bangText)
    });
    
    // Assemble the search components
    inputWrapper.append(this.searchInput, searchButton);
    this.form.appendChild(inputWrapper);
    
    // Create search info badges - improved appearance
    const searchInfo = createElement('div', {
      className: 'flex flex-wrap gap-2 mt-3 justify-center' 
    });
    
    // Search examples that visually explain bang syntax
    const examples = [
      { name: '!g', desc: 'Google' },
      { name: '!yt', desc: 'YouTube' },
      { name: '!w', desc: 'Wikipedia' },
      { name: "!gh", desc: "GitHub"}
    ];
    
    examples.forEach(ex => {
      const badge = createElement('span', {
        className: 'inline-flex items-center px-2 py-1 rounded-full bg-white/10 text-white/70 text-xs backdrop-blur-sm transition-all hover:bg-white/20 cursor-help'
      }, [`${ex.name} (${ex.desc})`]);
      
      searchInfo.appendChild(badge);
    });
    
    // Add search heading, form, and info to search container
    this.container.append(searchHeading, this.form, searchInfo);
    
    // Add event listener for form submission
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      let query = this.searchInput.value.trim();
      
      // If no bang is specified and a default bang is set, prepend it
      if (!query.includes('!') && this.settings.defaultBang) {
        query = `!${this.settings.defaultBang} ${query}`;
      }
      
      if (query) {
        // Add loading state to button when form is submitted
        const button = this.form.querySelector('button');
        if (button) {
          // Replace the icon with a spinner
          button.innerHTML = '<span class="animate-spin text-white">↻</span>';
          button.disabled = true;
        }
        
        // Create a loading overlay to prevent white flash
        const loadingOverlay = createElement('div', {
          className: 'fixed inset-0 bg-[#000] bg-opacity-90 z-50 flex items-center justify-center',
          style: 'backdrop-filter: blur(5px);'
        });
        
        const spinner = createElement('div', {
          className: 'w-12 h-12 border-4 border-[#3a86ff] border-t-transparent rounded-full animate-spin'
        });
        
        loadingOverlay.appendChild(spinner);
        document.body.appendChild(loadingOverlay);
        
        // Short timeout to ensure the overlay is visible before redirect
        setTimeout(() => {
          // Redirect to the current page with the query parameter
          window.location.href = `${window.location.origin}?q=${encodeURIComponent(query)}`;
        }, 100);
      }
    });
    
    // Add event listeners for bang autocomplete
    this.setupBangAutocomplete();
  }
  
  private setupBangAutocomplete(): void {
    this.searchInput.addEventListener("input", () => {
      const inputValue = this.searchInput.value;
      const bangMatch = inputValue.match(/!([a-zA-Z0-9]*)$/);
      
      if (bangMatch) {
        const bangQuery = bangMatch[1].toLowerCase();
        
        // Try to match the current input with combined bangs from utils function
        if (bangQuery.length > 0) {
          // Import the function at the top level, not from this
          const combinedBangs = getCombinedBangs(this.settings);
          const directMatch = combinedBangs.find((b: BangItem) => b.t.toLowerCase() === bangQuery);
          if (directMatch) {
            // Store the match for use when form is submitted
            this.selectedBangItem = directMatch;
          }
        }
        
        // Null check before using bangDropdown
        if (this.bangDropdown) {
          this.bangDropdown.show(bangQuery);
        }
      } else {
        // Null check before using bangDropdown
        if (this.bangDropdown) {
          this.bangDropdown.hide();
        }
      }
    });
    
    // Handle keyboard navigation in dropdown
    this.searchInput.addEventListener("keydown", (e) => {
      // Null check before using bangDropdown
      if (!this.bangDropdown || !this.bangDropdown.isDropdownVisible()) return;
      
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          this.bangDropdown.navigateDown();
          break;
        case "ArrowUp":
          e.preventDefault();
          this.bangDropdown.navigateUp();
          break;
        case "Tab":
        case "Enter":
          e.preventDefault();
          this.bangDropdown.selectCurrent();
          break;
        case "Escape":
          this.bangDropdown.hide();
          break;
      }
    });
  }
  
  private handleBangSelection(bangText: string): void {
    const inputValue = this.searchInput.value;
    const lastBangPos = inputValue.lastIndexOf('!');
    
    if (lastBangPos >= 0) {
      // Replace the partial bang with the selected one and add a space
      const newValue = inputValue.substring(0, lastBangPos + 1) + bangText + ' ';
      this.searchInput.value = newValue;
      this.searchInput.focus();
      
      // Set cursor position after the bang
      setTimeout(() => {
        this.searchInput.selectionStart = this.searchInput.selectionEnd = newValue.length;
      }, 0);
    }
  }
  
  public getElement(): HTMLDivElement {
    return this.container;
  }
  
  public focus(): void {
    setTimeout(() => {
      // Check if this is a recursive query - use custom function for URL parameters
      const urlParams = getUrlParameters();
      const isRecursive = urlParams.get("recursive") === "true";
      const query = urlParams.get("q");
      
      console.log("SearchForm focus - Is Recursive:", isRecursive, "Query:", query);
      
      if (isRecursive && query) {
        console.log("Filling search input with query:", query);
        // If we have a recursive query, fill the search input with it
        this.searchInput.value = query;
        
        // Ensure cursor is positioned at the end
        this.searchInput.selectionStart = this.searchInput.selectionEnd = query.length;
        
        // Add a subtle pulse effect to the input rather than a full glow
        this.searchInput.classList.add('recursive-input');
        
        // Create and add a CSS rule for the subtle effect
        if (!document.getElementById('recursive-style')) {
          const style = document.createElement('style');
          style.id = 'recursive-style';
          style.textContent = `
            .recursive-input {
              border-color: rgba(138, 43, 226, 0.3) !important;
              transition: all 0.3s ease;
            }
            
            .recursive-input:focus {
              border-color: rgba(138, 43, 226, 0.5) !important;
              box-shadow: 0 0 10px rgba(138, 43, 226, 0.2);
            }
          `;
          document.head.appendChild(style);
        }
      }
      
      this.searchInput.focus();
    }, 100);
  }
  
  /**
   * Reinitializes the bang dropdown when settings are changed
   * This ensures the dropdown is refreshed after custom bangs are added or removed
   */
  private reinitializeBangDropdown(): void {
    // Properly dispose the existing dropdown to clean up event listeners
    if (this.bangDropdown) {
      this.bangDropdown.dispose(); // Use the new dispose method to clean up
      this.bangDropdown = null;
    }

    // Remove any existing event listeners from the search input
    const oldInput = this.searchInput;
    const parent = oldInput.parentElement;
    
    // Create a new input element with the same properties
    const newInput = createElement('input', {
      type: 'text',
      placeholder: oldInput.placeholder,
      className: oldInput.className,
      autocomplete: 'off',
      spellcheck: 'false',
      autocapitalize: 'off',
      value: oldInput.value
    }) as HTMLInputElement;
    
    // Replace the old input with the new one
    if (parent) {
      parent.replaceChild(newInput, oldInput);
      this.searchInput = newInput;
    }
    
    // Reinitialize the bang dropdown with the new input
    this.bangDropdown = new BangDropdown(this.searchInput, {
      onSelectBang: (bangText) => this.handleBangSelection(bangText)
    });
    
    // Reattach event listeners to the new input
    this.setupBangAutocomplete();
    
    // Focus the new input
    this.searchInput.focus();
  }
} 