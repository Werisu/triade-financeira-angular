import { Injectable } from '@angular/core';
// @ts-ignore
import * as XLSX from 'xlsx';

export interface ImportedExpense {
  description: string;
  amount: number;
  category: string;
  date: string;
  credit_card_id: string;
  tags?: string[];
  installment_number?: number;
  total_installments?: number;
}

export interface ImportResult {
  success: boolean;
  imported: ImportedExpense[];
  errors: string[];
  totalRows: number;
}

@Injectable({
  providedIn: 'root',
})
export class ExcelImportService {
  private readonly expectedColumns = [
    'descricao',
    'valor',
    'categoria',
    'data',
    'cartao',
    'tags',
    'parcela_atual',
    'total_parcelas',
  ];

  private readonly columnMappings = {
    descricao: [
      'descricao',
      'descrição',
      'description',
      'desc',
      'descricao da transacao',
      'descricao da transação',
      'transacao',
      'transação',
      'operacao',
      'operação',
    ],
    valor: ['valor', 'amount', 'preco', 'preço', 'value', 'vlr', 'vl', 'rs', 'r$'],
    categoria: ['categoria', 'category', 'cat', 'tipo', 'classificacao', 'classificação'],
    data: ['data', 'date', 'data_compra', 'dt', 'data da transacao', 'data da transação'],
    cartao: [
      'cartao',
      'cartão',
      'credit_card',
      'card',
      'cartao de credito',
      'cartão de crédito',
      'meio de pagamento',
      'pagamento',
    ],
    tags: ['tags', 'tag', 'etiquetas', 'observacoes', 'observações'],
    parcela_atual: ['parcela_atual', 'parcela', 'installment', 'parcela_atual', 'parc'],
    total_parcelas: [
      'total_parcelas',
      'total_parcelas',
      'total_installments',
      'parcelas',
      'total_parc',
    ],
  };

  async importFromFile(
    file: File,
    creditCards: { id: string; name: string }[]
  ): Promise<ImportResult> {
    console.log('=== ExcelImportService.importFromFile INICIADO ===');
    console.log('Arquivo:', file.name, 'Tamanho:', file.size);
    console.log('Cartões disponíveis:', creditCards);

    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          console.log('FileReader onload executado');
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          console.log('Dados lidos:', data.length, 'bytes');

          const workbook = XLSX.read(data, { type: 'array' });
          console.log('Workbook criado:', workbook.SheetNames);

          const result = this.processWorkbook(workbook, creditCards, XLSX);
          console.log('Resultado do processamento:', result);
          resolve(result);
        } catch (error) {
          console.error('Erro no FileReader onload:', error);
          resolve({
            success: false,
            imported: [],
            errors: [`Erro ao processar arquivo: ${error}`],
            totalRows: 0,
          });
        }
      };

      reader.onerror = (error) => {
        console.error('Erro no FileReader:', error);
        resolve({
          success: false,
          imported: [],
          errors: ['Erro ao ler o arquivo'],
          totalRows: 0,
        });
      };

      console.log('Iniciando leitura do arquivo...');
      reader.readAsArrayBuffer(file);
    });
  }

  private processWorkbook(
    workbook: any,
    creditCards: { id: string; name: string }[],
    XLSX: any
  ): ImportResult {
    const result: ImportResult = {
      success: true,
      imported: [],
      errors: [],
      totalRows: 0,
    };

    try {
      // Pegar a primeira planilha
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Converter para JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        result.errors.push('Arquivo deve ter pelo menos um cabeçalho e uma linha de dados');
        result.success = false;
        return result;
      }

      // Primeira linha é o cabeçalho
      const headers = (jsonData[0] as string[]).map(
        (h) => h?.toString().toLowerCase().trim() || ''
      );
      console.log('Cabeçalhos encontrados:', headers);

      const columnIndexes = this.mapColumns(headers);
      console.log('Mapeamento de colunas:', columnIndexes);

      if (Object.keys(columnIndexes).length < 4) {
        result.errors.push(
          'Arquivo deve ter pelo menos as colunas: descrição, valor, categoria, data'
        );
        result.success = false;
        return result;
      }

      result.totalRows = jsonData.length - 1;

      // Processar cada linha de dados
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        const expense = this.processRow(row, columnIndexes, creditCards, i + 1);

        if (expense) {
          result.imported.push(expense);
        } else {
          result.errors.push(`Linha ${i + 1}: Dados inválidos ou incompletos`);
        }
      }

      if (result.imported.length === 0) {
        result.success = false;
        result.errors.push('Nenhuma despesa válida foi encontrada no arquivo');
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Erro ao processar planilha: ${error}`);
    }

    return result;
  }

  private mapColumns(headers: string[]): { [key: string]: number } {
    const columnIndexes: { [key: string]: number } = {};

    headers.forEach((header, index) => {
      const cleanHeader = header.toLowerCase().trim();
      Object.entries(this.columnMappings).forEach(([key, variations]) => {
        // Verifica se o cabeçalho contém alguma das variações
        if (variations.some((variation) => cleanHeader.includes(variation.toLowerCase()))) {
          // Só mapeia se ainda não foi mapeado
          if (!columnIndexes[key]) {
            columnIndexes[key] = index;
            console.log(`Mapeado: "${header}" -> ${key} (índice ${index})`);
          }
        }
      });
    });

    return columnIndexes;
  }

  private processRow(
    row: any[],
    columnIndexes: { [key: string]: number },
    creditCards: { id: string; name: string }[],
    rowNumber: number
  ): ImportedExpense | null {
    try {
      // Log da linha sendo processada (apenas para as primeiras 3 linhas)
      if (rowNumber <= 3) {
        console.log(`Processando linha ${rowNumber}:`, row);
        console.log('Column indexes:', columnIndexes);
      }

      // Campos obrigatórios
      const description = row[columnIndexes['descricao']]?.toString().trim();
      const amountStr = row[columnIndexes['valor']]?.toString().trim();
      const category = row[columnIndexes['categoria']]?.toString().trim();
      const dateStr = row[columnIndexes['data']]; // Pode ser string ou number (data do Excel)
      const cardName = row[columnIndexes['cartao']]?.toString().trim();

      if (rowNumber <= 3) {
        console.log(`Linha ${rowNumber} - Dados extraídos:`, {
          description,
          amountStr,
          category,
          dateStr,
          cardName,
        });
      }

      if (
        !description ||
        !amountStr ||
        !category ||
        dateStr === null ||
        dateStr === undefined ||
        !cardName
      ) {
        if (rowNumber <= 3) {
          console.log(`Linha ${rowNumber} - Dados incompletos:`, {
            description: !!description,
            amountStr: !!amountStr,
            category: !!category,
            dateStr: dateStr !== null && dateStr !== undefined,
            cardName: !!cardName,
          });
        }
        return null;
      }

      // Processar valor
      const amount = this.parseAmount(amountStr);
      if (rowNumber <= 3) {
        console.log(`Linha ${rowNumber} - Valor processado:`, amount, 'de:', amountStr);
      }
      if (isNaN(amount) || amount <= 0) {
        if (rowNumber <= 3) {
          console.log(`Linha ${rowNumber} - Valor inválido:`, amount);
        }
        return null;
      }

      // Processar data
      const date = this.parseDate(dateStr);
      if (rowNumber <= 3) {
        console.log(`Linha ${rowNumber} - Data processada:`, date, 'de:', dateStr);
      }
      if (!date) {
        if (rowNumber <= 3) {
          console.log(`Linha ${rowNumber} - Data inválida:`, dateStr);
        }
        return null;
      }

      // Encontrar cartão
      const creditCard = creditCards.find(
        (card) =>
          card.name.toLowerCase().includes(cardName.toLowerCase()) ||
          cardName.toLowerCase().includes(card.name.toLowerCase())
      );

      if (rowNumber <= 3) {
        console.log(`Linha ${rowNumber} - Cartão encontrado:`, creditCard);
        console.log(
          `Linha ${rowNumber} - Cartões disponíveis:`,
          creditCards.map((c) => c.name)
        );
        console.log(`Linha ${rowNumber} - Nome do cartão na linha: "${cardName}"`);
      }

      if (!creditCard) {
        if (rowNumber <= 3) {
          console.log(`Linha ${rowNumber} - Cartão não encontrado: "${cardName}"`);
        }
        return null;
      }

      // Campos opcionais
      const tagsStr = row[columnIndexes['tags']]?.toString().trim();
      const tags = tagsStr
        ? tagsStr
            .split(',')
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag)
        : [];

      const installmentNumber = row[columnIndexes['parcela_atual']]
        ? parseInt(row[columnIndexes['parcela_atual']])
        : undefined;

      const totalInstallments = row[columnIndexes['total_parcelas']]
        ? parseInt(row[columnIndexes['total_parcelas']])
        : undefined;

      const expense = {
        description,
        amount,
        category,
        date,
        credit_card_id: creditCard.id,
        tags: tags.length > 0 ? tags : undefined,
        installment_number: installmentNumber,
        total_installments: totalInstallments,
      };

      if (rowNumber <= 3) {
        console.log(`Linha ${rowNumber} - Despesa criada com sucesso:`, expense);
      }

      return expense;
    } catch (error) {
      return null;
    }
  }

  private parseAmount(amountStr: string): number {
    // Remover símbolos de moeda e espaços
    const cleanAmount = amountStr.replace(/[R$\s]/g, '').replace(',', '.');
    return parseFloat(cleanAmount);
  }

  private parseDate(dateStr: string | number): string | null {
    try {
      // Se for um número (data do Excel), converter
      if (typeof dateStr === 'number') {
        try {
          // Usar a biblioteca XLSX para converter corretamente
          // XLSX.SSF.parse_date_code converte números do Excel para data
          console.log('Tentando converter data numérica:', dateStr);
          console.log('XLSX disponível:', !!XLSX);
          console.log('XLSX.SSF disponível:', !!XLSX.SSF);
          console.log('XLSX.SSF.parse_date_code disponível:', !!XLSX.SSF?.parse_date_code);

          const date = XLSX.SSF.parse_date_code(dateStr);

          // Validar se a data é válida
          if (isNaN(date.getTime())) {
            console.error(`Data inválida gerada pela XLSX: ${dateStr} -> ${date}`);
            throw new Error('Data inválida');
          }

          console.log(`Data numérica do Excel: ${dateStr} -> ${date.toISOString().split('T')[0]}`);
          return date.toISOString().split('T')[0];
        } catch (error) {
          console.error('Erro ao converter data numérica:', error);
          // Fallback para conversão manual mais precisa
          // Excel conta dias desde 1900-01-01, mas tem um bug: considera 1900 como ano bissexto
          const excelDate = dateStr;
          let date: Date;

          if (excelDate <= 60) {
            // Para datas até 1900-02-29, usar a data direta
            date = new Date(1900, 0, excelDate);
          } else {
            // Para datas após 1900-02-29, subtrair 1 dia para corrigir o bug
            date = new Date(1900, 0, excelDate - 1);
          }

          // Validar se a data é válida
          if (isNaN(date.getTime())) {
            console.error(`Data inválida gerada: ${dateStr} -> ${date}`);
            return null;
          }

          console.log(
            `Fallback - Data numérica do Excel: ${dateStr} -> ${date.toISOString().split('T')[0]}`
          );
          return date.toISOString().split('T')[0];
        }
      }

      // Tentar diferentes formatos de data
      const formats = [
        /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
        /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
        /^\d{1,2}\/\d{1,2}\/\d{4}$/, // D/M/YYYY
      ];

      let date: Date | null = null;

      if (formats[0].test(dateStr.toString())) {
        date = new Date(dateStr.toString());
      } else if (
        formats[1].test(dateStr.toString()) ||
        formats[2].test(dateStr.toString()) ||
        formats[3].test(dateStr.toString())
      ) {
        const parts = dateStr.toString().split(/[\/\-]/);
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1; // JavaScript months are 0-based
          const year = parseInt(parts[2]);
          date = new Date(year, month, day);
        }
      }

      if (date && !isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  generateTemplate(): void {
    try {
      const templateData = [
        [
          'Descrição da Transação',
          'Valor (R$)',
          'Categoria',
          'Data',
          'Cartão',
          'Tags',
          'Parcela Atual',
          'Total de Parcelas',
        ],
        [
          'Supermercado Extra',
          '150.50',
          'Alimentação',
          '2024-01-15',
          'Nubank',
          'compras,supermercado',
          '1',
          '1',
        ],
        ['Netflix', '45.90', 'Lazer', '2024-01-10', 'Itaú', 'streaming,entretenimento', '1', '1'],
        [
          'iPhone 15',
          '5000.00',
          'Tecnologia',
          '2024-01-05',
          'Nubank',
          'celular,tecnologia',
          '1',
          '12',
        ],
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Despesas');

      XLSX.writeFile(workbook, 'template_despesas_cartao.xlsx');
    } catch (error) {
      console.error('Erro ao gerar template:', error);
      throw error;
    }
  }
}
