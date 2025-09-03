import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CreditCardExpenseService } from '../../../services/credit-card-expense.service';
import { CreditCardService } from '../../../services/credit-card.service';
import { ExcelImportService, ImportResult } from '../../../services/excel-import.service';
import { CreditCard, CreditCardExpense } from '../../../types';

@Component({
  selector: 'app-credit-card-expense-import',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './credit-card-expense-import.component.html',
  styleUrls: ['./credit-card-expense-import.component.css'],
})
export class CreditCardExpenseImportComponent implements OnInit {
  @Input() userId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() imported = new EventEmitter<CreditCardExpense[]>();

  private creditCardService = inject(CreditCardService);
  private expenseService = inject(CreditCardExpenseService);
  private excelImportService = inject(ExcelImportService);

  creditCards: CreditCard[] = [];
  selectedFile: File | null = null;
  importResult: ImportResult | null = null;
  loading = false;
  importing = false;
  error = '';

  ngOnInit() {
    this.loadCreditCards();
  }

  async loadCreditCards() {
    console.log('=== loadCreditCards INICIADO ===');
    try {
      this.creditCards = await this.creditCardService.getCreditCards();
      console.log('✅ Cartões carregados:', this.creditCards);
    } catch (error) {
      console.error('❌ Erro ao carregar cartões:', error);
      this.error = 'Erro ao carregar cartões de crédito';
    }
    console.log('=== loadCreditCards FINALIZADO ===');
  }

  onFileSelected(event: any) {
    console.log('=== onFileSelected INICIADO ===');
    console.log('Event:', event);
    const file = event.target.files[0];
    console.log('Arquivo selecionado:', file);

    if (file) {
      console.log('Tipo do arquivo:', file.type);
      console.log('Nome do arquivo:', file.name);
      console.log('Tamanho do arquivo:', file.size);

      if (
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        file.name.toLowerCase().endsWith('.xlsx') ||
        file.name.toLowerCase().endsWith('.xls')
      ) {
        this.selectedFile = file;
        this.error = '';
        this.importResult = null;
        console.log('✅ Arquivo aceito:', file.name);
      } else {
        this.error = `Tipo de arquivo não suportado: ${file.type}. Por favor, selecione um arquivo Excel (.xlsx ou .xls)`;
        this.selectedFile = null;
        console.log('❌ Arquivo rejeitado:', file.type);
      }
    } else {
      console.log('❌ Nenhum arquivo selecionado');
    }
    console.log('=== onFileSelected FINALIZADO ===');
  }

  async processFile() {
    console.log('=== processFile() INICIADO ===');
    console.log('selectedFile:', this.selectedFile);
    console.log('creditCards:', this.creditCards);

    if (!this.selectedFile) {
      console.log('ERRO: Nenhum arquivo selecionado');
      this.error = 'Por favor, selecione um arquivo';
      return;
    }

    console.log('Iniciando processamento...');
    this.loading = true;
    this.error = '';

    try {
      const creditCardsForImport = this.creditCards.map((card) => ({
        id: card.id,
        name: card.name,
      }));

      console.log('creditCardsForImport:', creditCardsForImport);
      console.log('Chamando excelImportService.importFromFile...');

      this.importResult = await this.excelImportService.importFromFile(
        this.selectedFile,
        creditCardsForImport
      );

      console.log('Resultado recebido:', this.importResult);

      if (!this.importResult.success) {
        console.log('Import falhou:', this.importResult.errors);
        this.error = 'Erro ao processar arquivo. Verifique os dados e tente novamente.';
      } else {
        console.log(
          'Import bem-sucedido!',
          this.importResult.imported.length,
          'despesas encontradas'
        );
      }
    } catch (error) {
      console.error('ERRO CAPTURADO em processFile:', error);
      this.error = `Erro ao processar arquivo: ${error}`;
    } finally {
      console.log('Finalizando processamento...');
      this.loading = false;
      console.log('=== processFile() FINALIZADO ===');
    }
  }

  async importExpenses() {
    if (!this.importResult || !this.importResult.success) {
      return;
    }

    this.importing = true;
    const importedExpenses: CreditCardExpense[] = [];

    try {
      for (const expense of this.importResult.imported) {
        const newExpense = await this.expenseService.createCreditCardExpense({
          ...expense,
          user_id: this.userId,
          tags: expense.tags || [],
        });
        importedExpenses.push(newExpense);
      }

      this.imported.emit(importedExpenses);
      this.close.emit();
    } catch (error) {
      this.error = 'Erro ao importar algumas despesas';
    } finally {
      this.importing = false;
    }
  }

  downloadTemplate() {
    try {
      this.excelImportService.generateTemplate();
    } catch (error) {
      console.error('Erro ao baixar template:', error);
      this.error = 'Erro ao baixar template';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getCreditCardName(creditCardId: string): string {
    const card = this.creditCards.find((c) => c.id === creditCardId);
    return card ? card.name : 'Cartão não encontrado';
  }

  onClose() {
    this.close.emit();
  }
}
