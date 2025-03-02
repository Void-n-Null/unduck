import { createElement } from "../utils/dom";
import { BangItem } from "../types/BangItem";

export class CustomBangEditor {
  private modal: HTMLDivElement | null = null;
  private overlay: HTMLDivElement | null = null;
  private isVisible = false;
  private onSave: (bang: BangItem | null, isEdit: boolean) => void;
  private isEditMode = false;
  private originalBang: BangItem | null = null;
  private errorMessage: HTMLDivElement | null = null;
  
  // Form elements
  private triggerInput: HTMLInputElement | null = null;
  private serviceInput: HTMLInputElement | null = null;
  private domainInput: HTMLInputElement | null = null;
  private categoryInput: HTMLInputElement | null = null;
  private subcategoryInput: HTMLInputElement | null = null;
  private urlPatternInput: HTMLInputElement | null = null;
  
  constructor(onSave: (bang: BangItem | null, isEdit: boolean) => void) {
    this.onSave = onSave;
  }
  
  /**
   * Shows the editor for creating or editing a bang
   * @param bang Optional bang for edit mode
   */
  public show(bang?: BangItem): void {
    this.isEditMode = !!bang;
    this.originalBang = bang || null;
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
    
    // Populate form fields if editing
    if (bang) {
      this.populateFormFields(bang);
    }
  }
  
  /**
   * Hides and removes the editor modal
   */
  public hide(): void {
    if (!this.overlay) return;
    
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
   * Handler for ESC key to close the modal
   */
  private handleEscKey = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.isVisible) {
      this.hide();
    }
  };
  
  /**
   * Creates the modal elements if they don't exist
   */
  private createModal(): void {
    // Always recreate the modal to ensure a clean form
    if (this.modal && this.overlay && document.body.contains(this.overlay)) {
      document.body.removeChild(this.overlay);
    }
    
    // Create overlay
    this.overlay = createElement('div', {
      className: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center transition-opacity duration-300',
      style: 'opacity: 0;'
    });
    
    // Create modal
    this.modal = createElement('div', {
      className: 'bg-[#120821] border border-white/10 rounded-lg shadow-xl w-full max-w-md overflow-hidden transition-transform duration-300',
      style: 'transform: translateY(20px);'
    });
    
    // Create error message container (initially hidden)
    this.errorMessage = createElement('div', {
      className: 'hidden bg-red-500/20 border border-red-500/40 text-white px-4 py-3 mb-4 rounded',
      style: 'margin: 0 1rem; display: none;'
    });
    
    // Modal header
    const header = createElement('div', {
      className: 'bg-gradient-to-r from-[#2a004d] to-[#1a0036] px-6 py-4 flex justify-between items-center'
    });
    
    const title = createElement('h2', {
      className: 'text-white text-xl font-bold'
    }, [this.isEditMode ? 'Edit Custom Bang' : 'Add Custom Bang']);
    
    const closeButton = createElement('button', {
      className: 'text-white/80 hover:text-white transition-colors'
    }, ['×']);
    closeButton.addEventListener('click', () => this.hide());
    
    header.append(title, closeButton);
    
    // Modal content (form)
    const content = createElement('div', {
      className: 'px-6 py-4'
    });
    
    // Create form
    const form = this.createBangForm();
    content.appendChild(form);
    
    // Modal footer
    const footer = createElement('div', {
      className: 'bg-black/30 px-6 py-4 flex justify-end gap-2'
    });
    
    const cancelButton = createElement('button', {
      className: 'bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded transition-colors',
      type: 'button'
    }, ['Cancel']);
    cancelButton.addEventListener('click', () => this.hide());
    
    const saveButton = createElement('button', {
      className: 'bg-[#3a86ff] hover:bg-[#2a76ef] text-white px-4 py-2 rounded transition-colors',
      type: 'button'
    }, [this.isEditMode ? 'Update' : 'Create']);
    saveButton.addEventListener('click', () => this.saveBang());
    
    footer.append(cancelButton, saveButton);
    
    // Assemble modal
    this.modal.append(header, this.errorMessage, content, footer);
    this.overlay.appendChild(this.modal);
    
    // Close when clicking overlay (not the modal itself)
    this.overlay.addEventListener('click', (e: MouseEvent) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });
  }
  
  /**
   * Creates the form for entering bang details
   */
  private createBangForm(): HTMLFormElement {
    const form = createElement('form', {
      className: 'space-y-4'
    }) as HTMLFormElement;
    
    // Prevent form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveBang();
    });
    
    // Bang trigger (shortcut)
    const triggerGroup = this.createFormGroup(
      'Shortcut',
      'The unique code used to trigger this bang (e.g., "g" for Google)',
      true
    );
    
    this.triggerInput = createElement('input', {
      type: 'text',
      className: 'w-full px-4 py-2 bg-black/20 backdrop-blur-sm hover:bg-black/30 placeholder-white/50 rounded border border-white/10 focus:border-[#3a86ff]/50 focus:bg-black/40 focus:outline-none transition-all text-white',
      placeholder: 'e.g., maps',
      autocomplete: 'off',
      spellcheck: 'false',
      maxlength: '20',
      required: 'true'
    }) as HTMLInputElement;
    
    if (this.isEditMode) {
      // Make trigger read-only in edit mode to prevent changing the ID
      this.triggerInput.readOnly = true;
      this.triggerInput.className += ' opacity-70 cursor-not-allowed';
    }
    
    // Add validation for trigger - alphanumeric only
    this.triggerInput.addEventListener('input', () => {
      if (this.triggerInput) {
        // Remove any characters that aren't a-z, A-Z, 0-9, or underscore
        this.triggerInput.value = this.triggerInput.value.replace(/[^a-zA-Z0-9_]/g, '');
      }
    });
    
    triggerGroup.appendChild(this.triggerInput);
    form.appendChild(triggerGroup);
    
    // Service name
    const serviceGroup = this.createFormGroup(
      'Service Name',
      'The name of the service this bang searches (e.g., "Google Maps")',
      true
    );
    
    this.serviceInput = createElement('input', {
      type: 'text',
      className: 'w-full px-4 py-2 bg-black/20 backdrop-blur-sm hover:bg-black/30 placeholder-white/50 rounded border border-white/10 focus:border-[#3a86ff]/50 focus:bg-black/40 focus:outline-none transition-all text-white',
      placeholder: 'e.g., Google Maps',
      autocomplete: 'off',
      required: 'true'
    }) as HTMLInputElement;
    
    serviceGroup.appendChild(this.serviceInput);
    form.appendChild(serviceGroup);
    
    // Domain
    const domainGroup = this.createFormGroup(
      'Domain',
      'The domain of the service (e.g., "maps.google.com")',
      true
    );
    
    this.domainInput = createElement('input', {
      type: 'text',
      className: 'w-full px-4 py-2 bg-black/20 backdrop-blur-sm hover:bg-black/30 placeholder-white/50 rounded border border-white/10 focus:border-[#3a86ff]/50 focus:bg-black/40 focus:outline-none transition-all text-white',
      placeholder: 'e.g., maps.google.com',
      autocomplete: 'off',
      required: 'true'
    }) as HTMLInputElement;
    
    domainGroup.appendChild(this.domainInput);
    form.appendChild(domainGroup);
    
    // Category (optional)
    const categoryGroup = this.createFormGroup(
      'Category',
      'Optional category for the bang (e.g., "maps", "search")',
      false
    );
    
    this.categoryInput = createElement('input', {
      type: 'text',
      className: 'w-full px-4 py-2 bg-black/20 backdrop-blur-sm hover:bg-black/30 placeholder-white/50 rounded border border-white/10 focus:border-[#3a86ff]/50 focus:bg-black/40 focus:outline-none transition-all text-white',
      placeholder: 'e.g., maps',
      autocomplete: 'off'
    }) as HTMLInputElement;
    
    categoryGroup.appendChild(this.categoryInput);
    form.appendChild(categoryGroup);
    
    // Subcategory (optional)
    const subcategoryGroup = this.createFormGroup(
      'Subcategory',
      'Optional subcategory for more specific classification',
      false
    );
    
    this.subcategoryInput = createElement('input', {
      type: 'text',
      className: 'w-full px-4 py-2 bg-black/20 backdrop-blur-sm hover:bg-black/30 placeholder-white/50 rounded border border-white/10 focus:border-[#3a86ff]/50 focus:bg-black/40 focus:outline-none transition-all text-white',
      placeholder: 'e.g., directions',
      autocomplete: 'off'
    }) as HTMLInputElement;
    
    subcategoryGroup.appendChild(this.subcategoryInput);
    form.appendChild(subcategoryGroup);
    
    // URL Pattern (with search term placeholder)
    const urlPatternGroup = this.createFormGroup(
      'URL Pattern',
      'The URL pattern with {searchTerms} as placeholder for the query',
      true
    );
    
    this.urlPatternInput = createElement('input', {
      type: 'text',
      className: 'w-full px-4 py-2 bg-black/20 backdrop-blur-sm hover:bg-black/30 placeholder-white/50 rounded border border-white/10 focus:border-[#3a86ff]/50 focus:bg-black/40 focus:outline-none transition-all text-white font-mono text-sm',
      placeholder: 'e.g., https://maps.google.com/maps?q={searchTerms}',
      autocomplete: 'off',
      required: 'true'
    }) as HTMLInputElement;
    
    urlPatternGroup.appendChild(this.urlPatternInput);
    form.appendChild(urlPatternGroup);
    
    // Help text about the URL pattern
    const helpText = createElement('div', {
      className: 'text-white/50 text-xs mt-2'
    }, ['Use {searchTerms} as a placeholder for the search query. For example: https://example.com/search?q={searchTerms}']);
    
    form.appendChild(helpText);
    
    return form;
  }
  
  /**
   * Creates a form group with label and description
   */
  private createFormGroup(
    label: string,
    description: string,
    isRequired: boolean
  ): HTMLDivElement {
    const group = createElement('div', {
      className: 'mb-4'
    });
    
    const labelElement = createElement('label', {
      className: 'block text-white text-sm font-medium mb-1'
    });
    
    // Label text with optional required indicator
    const labelText = createElement('span', {}, [label]);
    labelElement.appendChild(labelText);
    
    if (isRequired) {
      const requiredIndicator = createElement('span', {
        className: 'text-[#ff3a3a] ml-1'
      }, ['*']);
      labelElement.appendChild(requiredIndicator);
    }
    
    const descriptionElement = createElement('p', {
      className: 'text-white/60 text-xs mb-2'
    }, [description]);
    
    group.append(labelElement, descriptionElement);
    
    return group;
  }
  
  /**
   * Populates the form fields with bang data
   */
  private populateFormFields(bang: BangItem): void {
    if (this.triggerInput) this.triggerInput.value = bang.t;
    if (this.serviceInput) this.serviceInput.value = bang.s;
    if (this.domainInput) this.domainInput.value = bang.d;
    if (this.categoryInput) this.categoryInput.value = bang.c || '';
    if (this.subcategoryInput) this.subcategoryInput.value = bang.sc || '';
    if (this.urlPatternInput) this.urlPatternInput.value = bang.u;
  }
  
  /**
   * Saves the bang data and closes the modal
   */
  private saveBang(): void {
    // Validate form
    if (!this.validateForm()) {
      return;
    }
    
    // Create bang object from form data
    const bang: BangItem = {
      t: this.triggerInput?.value.trim() || '',
      s: this.serviceInput?.value.trim() || '',
      d: this.domainInput?.value.trim() || '',
      c: this.categoryInput?.value.trim() || undefined,
      sc: this.subcategoryInput?.value.trim() || undefined,
      r: this.originalBang?.r || 9999, // High relevance score for custom bangs
      u: this.urlPatternInput?.value.trim() || ''
    };
    
    // If category is empty, set it to undefined
    if (bang.c === '') bang.c = undefined;
    
    // If subcategory is empty, set it to undefined
    if (bang.sc === '') bang.sc = undefined;
    
    // If subcategory is provided but category is not, use subcategory as category
    if (bang.sc && !bang.c) bang.c = bang.sc;
    
    // Call the onSave callback
    this.onSave(bang, this.isEditMode);
    
    // Close the modal
    this.hide();
  }
  
  /**
   * Shows an error message in the form instead of using an alert
   */
  private showError(message: string, inputToFocus?: HTMLInputElement | null): void {
    if (this.errorMessage) {
      this.errorMessage.textContent = message;
      this.errorMessage.style.display = 'block';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        if (this.errorMessage) {
          this.errorMessage.style.display = 'none';
        }
      }, 5000);
    }
    
    // Focus the input if provided
    if (inputToFocus) {
      setTimeout(() => inputToFocus.focus(), 10);
    }
  }
  
  /**
   * Hide the error message
   */
  private hideError(): void {
    if (this.errorMessage) {
      this.errorMessage.style.display = 'none';
    }
  }
  
  /**
   * Validates the form
   */
  private validateForm(): boolean {
    // Hide any previous error message
    this.hideError();
    
    // Check required fields
    if (!this.triggerInput?.value.trim()) {
      this.showError('Shortcut is required', this.triggerInput);
      return false;
    }
    
    if (!this.serviceInput?.value.trim()) {
      this.showError('Service name is required', this.serviceInput);
      return false;
    }
    
    if (!this.domainInput?.value.trim()) {
      this.showError('Domain is required', this.domainInput);
      return false;
    }
    
    if (!this.urlPatternInput?.value.trim()) {
      this.showError('URL pattern is required', this.urlPatternInput);
      return false;
    }
    
    // Check URL pattern has search terms placeholder
    if (!this.urlPatternInput?.value.includes('{searchTerms}')) {
      this.showError('URL pattern must include {searchTerms} placeholder', this.urlPatternInput);
      return false;
    }
    
    return true;
  }
} 