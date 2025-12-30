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
      <!-- Mode affichage -->
      <div *ngIf="!isEditing" class="clients-display">
        <span class="client-badge" *ngFor="let client of clients">
          {{ client }}
        </span>
        <span *ngIf="clients.length === 0" class="empty-text">-</span>
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

        <div *ngIf="clients.length > 0" class="clients-list">
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
      min-height: 32px;
    }

    .clients-display {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      min-height: 32px;
      align-items: center;
    }

    .clients-editor {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
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

    .clients-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .client-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      background: linear-gradient(135deg, #9C27B0, #BA68C8);
      color: white;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .client-badge.editable {
      padding-right: 0.25rem;
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
    }

    .remove-client:hover {
      opacity: 1;
    }

    .empty-text {
      color: #999;
      font-style: italic;
      font-size: 0.85rem;
    }
  `]
})
export class ClientsManagerComponent {
  @Input() clients: string[] = [];
  @Input() isEditing: boolean = false;
  @Input() availableClientsList: string[] = [];
  @Output() clientsChange = new EventEmitter<string[]>();

  selectedClient = '';

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
}
