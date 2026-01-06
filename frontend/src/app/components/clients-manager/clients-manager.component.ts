// frontend/src/app/components/clients-manager/clients-manager.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clients-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="clients-manager">
      <!-- Mode affichage avec liste déroulante compacte -->
      <div *ngIf="!isEditing" class="clients-display">
        <div *ngIf="clients.length === 0" class="empty-text">-</div>
        <div *ngIf="clients.length > 0" class="clients-dropdown">
          <button
            type="button"
            class="dropdown-toggle"
            (click)="showDropdown = !showDropdown"
            (blur)="onBlur()">
            <span class="client-count">{{ clients.length }} client(s)</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div *ngIf="showDropdown" class="dropdown-menu">
            <div class="dropdown-item" *ngFor="let client of clients">
              {{ client }}
            </div>
          </div>
        </div>
      </div>

      <!-- Mode édition -->
      <div *ngIf="isEditing" class="clients-editor">
        <select
          [(ngModel)]="selectedClient"
          (change)="onAddClient()"
          name="clientSelector"
          class="client-select">
          <option value="">Ajouter un client</option>
          <option *ngFor="let client of availableClientsList" [value]="client">
            {{ client }}
          </option>
        </select>

        <div *ngIf="clients.length > 0" class="clients-list-edit">
          <span class="client-badge editable" *ngFor="let client of clients; let i = index">
            {{ client }}
            <button
              type="button"
              class="remove-client"
              (click)="onRemoveClient(i)"
              title="Retirer">
              ×
            </button>
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .clients-manager {
      width: 100%;
      min-height: 32px;
    }

    .clients-display {
      width: 100%;
      min-height: 32px;
      display: flex;
      align-items: center;
    }

    .empty-text {
      color: #999;
      font-style: italic;
      font-size: 0.85rem;
      padding: 0.3rem;
    }

    /* Liste déroulante compacte */
    .clients-dropdown {
      position: relative;
      width: 100%;
    }

    .dropdown-toggle {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.75rem;
      background: linear-gradient(135deg, #9C27B0, #BA68C8);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .dropdown-toggle:hover {
      background: linear-gradient(135deg, #7B1FA2, #9C27B0);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(156, 39, 176, 0.3);
    }

    .client-count {
      flex: 1;
      text-align: left;
    }

    .dropdown-toggle svg {
      stroke-width: 2;
      transition: transform 0.3s ease;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: white;
      border: 1.5px solid #e0e0e0;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-height: 200px;
      overflow-y: auto;
      z-index: 100;
      animation: slideDown 0.2s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown-item {
      padding: 0.6rem 0.75rem;
      font-size: 0.85rem;
      color: #333;
      border-bottom: 1px solid #f5f5f5;
      transition: background 0.2s ease;
    }

    .dropdown-item:last-child {
      border-bottom: none;
    }

    .dropdown-item:hover {
      background: #f5f5f5;
    }

    .dropdown-menu::-webkit-scrollbar {
      width: 6px;
    }

    .dropdown-menu::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .dropdown-menu::-webkit-scrollbar-thumb {
      background: #9C27B0;
      border-radius: 3px;
    }

    /* Mode édition */
    .clients-editor {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
    }

    .client-select {
      width: 100%;
      padding: 0.5rem;
      border: 1.5px solid #e0e0e0;
      border-radius: 6px;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      background: white;
    }

    .client-select:focus {
      outline: none;
      border-color: #9C27B0;
      box-shadow: 0 0 0 3px rgba(156, 39, 176, 0.1);
    }

    .clients-list-edit {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      max-height: 120px;
      overflow-y: auto;
      padding: 0.25rem 0;
    }

    .clients-list-edit::-webkit-scrollbar {
      width: 6px;
    }

    .clients-list-edit::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .clients-list-edit::-webkit-scrollbar-thumb {
      background: #9C27B0;
      border-radius: 3px;
    }

    .client-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.3rem 0.6rem;
      background: linear-gradient(135deg, #9C27B0, #BA68C8);
      color: white;
      border-radius: 5px;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
      line-height: 1.2;
    }

    .client-badge.editable {
      padding-right: 0.3rem;
    }

    .remove-client {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0 0.25rem;
      line-height: 1;
      opacity: 0.8;
      transition: opacity 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .remove-client:hover {
      opacity: 1;
      transform: scale(1.1);
    }
  `]
})
export class ClientsManagerComponent {
  @Input() clients: string[] = [];
  @Input() isEditing: boolean = false;
  @Input() availableClientsList: string[] = [];
  @Output() clientsChange = new EventEmitter<string[]>();

  selectedClient = '';
  showDropdown = false;

  onAddClient() {
    if (this.selectedClient && !this.clients.includes(this.selectedClient)) {
      const updated = [...this.clients, this.selectedClient];
      this.clientsChange.emit(updated);
      this.selectedClient = '';
    }
  }

  onRemoveClient(index: number) {
    const updated = this.clients.filter((_, i) => i !== index);
    this.clientsChange.emit(updated);
  }

  onBlur() {
    // Petit délai pour permettre le clic sur un élément du menu
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }
}
