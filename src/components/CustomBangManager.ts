import { createElement } from "../utils/dom";
import { BangItem } from "../types/BangItem";
import { UserSettings, loadSettings, saveSettings } from "../utils/settings";
import { CustomBangEditor } from "./CustomBangEditor";

export class CustomBangManager {
  private modal: HTMLDivElement | null = null;
  private overlay: HTMLDivElement | null = null;
  private isVisible = false;
  private settings: UserSettings;
  private bangList: HTMLDivElement | null = null;
  private onSettingsChange: (settings: UserSettings) => void;
  private bangEditor: CustomBangEditor | null = null;
  private confirmationDialog: HTMLDivElement | null = null;
  private pendingDeleteBang: BangItem | null = null;

  constructor(onSettingsChange: (settings: UserSettings) => void = () => {}) {
    this.settings = loadSettings();
    this.onSettingsChange = onSettingsChange;
    this.bangEditor = new CustomBangEditor((bang: BangItem | null, isEdit: boolean) => {
      this.handleBangSave(bang, isEdit);
    });
  }

  /**
   * Creates and shows the custom bang manager modal
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
   * Hides and removes the custom bang manager modal
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
    if (this.modal) {
      // If modal exists, just refresh the bang list
      this.refreshBangList();
      return;
    }
    
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
    }, ['Custom Bangs']);
    
    const closeButton = createElement('button', {
      className: 'text-white/80 hover:text-white transition-colors'
    }, ['×']);
    closeButton.addEventListener('click', () => this.hide());
    
    header.append(title, closeButton);
    
    // Modal content
    const content = createElement('div', {
      className: 'px-6 py-4'
    });
    
    // Create description
    const description = createElement('p', {
      className: 'text-white/70 text-sm mb-4'
    }, ['Create and manage your custom bang shortcuts. Custom bangs will override default bangs with the same shortcut.']);
    
    // Create add button
    const addButtonContainer = createElement('div', {
      className: 'mb-4 flex justify-end'
    });
    
    const addButton = createElement('button', {
      className: 'bg-[#3a86ff] hover:bg-[#2a76ef] text-white px-4 py-2 rounded-full flex items-center transition-colors',
      type: 'button'
    }, [
      createElement('span', { className: 'mr-1' }, ['+']),
      'Add Custom Bang'
    ]);
    
    addButton.addEventListener('click', () => {
      if (this.bangEditor) {
        this.bangEditor.show();
      }
    });
    
    addButtonContainer.appendChild(addButton);
    
    // Create bang list container
    this.bangList = createElement('div', {
      className: 'max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent'
    });
    
    // Populate bang list
    this.refreshBangList();
    
    content.append(description, addButtonContainer, this.bangList);
    
    // Modal footer
    const footer = createElement('div', {
      className: 'bg-black/30 px-6 py-4 flex justify-end'
    });
    
    const closeModalButton = createElement('button', {
      className: 'bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded transition-colors',
      type: 'button'
    }, ['Close']);
    closeModalButton.addEventListener('click', () => this.hide());
    
    footer.appendChild(closeModalButton);
    
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
   * Refreshes the list of custom bangs
   */
  private refreshBangList(): void {
    if (!this.bangList) return;
    
    this.bangList.innerHTML = '';
    
    // If no custom bangs, show a message
    if (!this.settings.customBangs || this.settings.customBangs.length === 0) {
      const emptyMessage = createElement('div', {
        className: 'text-white/50 text-center py-6'
      }, ['No custom bangs yet. Add one to get started!']);
      
      this.bangList.appendChild(emptyMessage);
      return;
    }
    
    // Add each custom bang to the list
    this.settings.customBangs.forEach(bang => {
      const bangItem = this.createBangListItem(bang);
      this.bangList?.appendChild(bangItem);
    });
  }

  /**
   * Creates a list item for a bang
   */
  private createBangListItem(bang: BangItem): HTMLDivElement {
    const item = createElement('div', {
      className: 'p-4 hover:bg-black/30 border-b border-white/10 last:border-b-0 flex justify-between items-center'
    });
    
    // Left side - Bang info
    const bangInfo = createElement('div', {
      className: 'flex-1'
    });
    
    // Bang trigger and service
    const titleRow = createElement('div', {
      className: 'flex items-center gap-2 mb-1'
    });
    
    const trigger = createElement('span', {
      className: 'font-mono text-[#3a86ff] font-bold'
    }, [`!${bang.t}`]);
    
    const service = createElement('span', {
      className: 'text-white'
    }, [bang.s]);
    
    titleRow.append(trigger, service);
    
    // URL pattern
    const urlPattern = createElement('div', {
      className: 'text-white/60 text-sm truncate max-w-[250px]'
    }, [bang.u]);
    
    bangInfo.append(titleRow, urlPattern);
    
    // Right side - Actions
    const actions = createElement('div', {
      className: 'flex items-center gap-2'
    });
    
    // Edit button
    const editButton = createElement('button', {
      className: 'text-white/70 hover:text-white p-1 transition-colors',
      title: 'Edit'
    }, ['✏️']);
    
    editButton.addEventListener('click', () => {
      if (this.bangEditor) {
        this.bangEditor.show(bang);
      }
    });
    
    // Delete button
    const deleteButton = createElement('button', {
      className: 'text-white/70 hover:text-[#ff3a3a] p-1 transition-colors',
      title: 'Delete'
    }, ['🗑️']);
    
    deleteButton.addEventListener('click', () => {
      this.deleteBang(bang);
    });
    
    actions.append(editButton, deleteButton);
    
    item.append(bangInfo, actions);
    
    return item;
  }

  /**
   * Handles saving a new or edited bang
   */
  private handleBangSave(bang: BangItem | null, isEdit: boolean): void {
    if (!bang) return;
    
    // Initialize custom bangs array if it doesn't exist
    if (!this.settings.customBangs) {
      this.settings.customBangs = [];
    }
    
    if (isEdit) {
      // Update existing bang
      const index = this.settings.customBangs.findIndex(b => b.t === bang.t);
      if (index >= 0) {
        this.settings.customBangs[index] = bang;
      }
    } else {
      // Add new bang
      this.settings.customBangs.push(bang);
    }
    
    // Save settings
    saveSettings(this.settings);
    this.onSettingsChange(this.settings);
    
    // Refresh the bang list
    this.refreshBangList();
  }

  /**
   * Creates a non-blocking confirmation dialog
   */
  private showConfirmationDialog(message: string, onConfirm: () => void): void {
    // Remove any existing confirmation dialog
    if (this.confirmationDialog && document.body.contains(this.confirmationDialog)) {
      document.body.removeChild(this.confirmationDialog);
    }
    
    // Create dialog container
    this.confirmationDialog = createElement('div', {
      className: 'fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center transition-opacity duration-200',
      style: 'opacity: 0;'
    });
    
    // Create dialog box
    const dialogBox = createElement('div', {
      className: 'bg-[#1e0b30] border border-white/10 rounded-lg shadow-xl max-w-sm p-6 transition-transform duration-200',
      style: 'transform: translateY(20px);'
    });
    
    // Add message
    const messageElement = createElement('p', {
      className: 'text-white text-lg mb-6'
    }, [message]);
    
    // Add buttons container
    const buttonsContainer = createElement('div', {
      className: 'flex justify-end gap-3'
    });
    
    // Cancel button
    const cancelButton = createElement('button', {
      className: 'bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded transition-colors',
      type: 'button'
    }, ['Cancel']);
    
    // Delete button
    const confirmButton = createElement('button', {
      className: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors',
      type: 'button'
    }, ['Delete']);
    
    // Add click handlers
    cancelButton.addEventListener('click', () => {
      this.closeConfirmationDialog();
    });
    
    confirmButton.addEventListener('click', () => {
      onConfirm();
      this.closeConfirmationDialog();
    });
    
    // Assemble dialog
    buttonsContainer.append(cancelButton, confirmButton);
    dialogBox.append(messageElement, buttonsContainer);
    this.confirmationDialog.appendChild(dialogBox);
    
    // Add to body
    document.body.appendChild(this.confirmationDialog);
    
    // Animate in
    setTimeout(() => {
      if (this.confirmationDialog) {
        this.confirmationDialog.style.opacity = '1';
        dialogBox.style.transform = 'translateY(0)';
      }
    }, 10);
    
    // Close when clicking outside
    this.confirmationDialog.addEventListener('click', (e) => {
      if (e.target === this.confirmationDialog) {
        this.closeConfirmationDialog();
      }
    });
    
    // Add ESC key handler
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeConfirmationDialog();
        document.removeEventListener('keydown', escHandler);
      }
    };
    
    document.addEventListener('keydown', escHandler);
  }
  
  /**
   * Close the confirmation dialog
   */
  private closeConfirmationDialog(): void {
    if (!this.confirmationDialog) return;
    
    // Animate out
    this.confirmationDialog.style.opacity = '0';
    const dialogBox = this.confirmationDialog.querySelector('div');
    if (dialogBox) {
      dialogBox.style.transform = 'translateY(20px)';
    }
    
    // Remove after animation
    setTimeout(() => {
      if (this.confirmationDialog && document.body.contains(this.confirmationDialog)) {
        document.body.removeChild(this.confirmationDialog);
        this.confirmationDialog = null;
      }
    }, 200);
  }

  /**
   * Deletes a bang
   */
  private deleteBang(bang: BangItem): void {
    if (!this.settings.customBangs) return;
    
    // Store the bang to delete
    this.pendingDeleteBang = bang;
    
    // Show confirmation dialog
    this.showConfirmationDialog(
      `Are you sure you want to delete the !${bang.t} bang?`, 
      () => this.confirmDeleteBang()
    );
  }
  
  /**
   * Actually performs the bang deletion after confirmation
   */
  private confirmDeleteBang(): void {
    if (!this.pendingDeleteBang || !this.settings.customBangs) return;
    
    // Remove bang from settings
    this.settings.customBangs = this.settings.customBangs.filter(
      b => b.t !== this.pendingDeleteBang!.t
    );
    
    // Save settings
    saveSettings(this.settings);
    this.onSettingsChange(this.settings);
    
    // Refresh the bang list
    this.refreshBangList();
    
    // Clear the pending delete
    this.pendingDeleteBang = null;
  }
} 