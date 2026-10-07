import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from '../../context/LocaleContext';
import { formatCurrency } from '../../utils/format';

function download(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportButtons({ transactions, products }) {
  const { t } = useTranslation();
  const rows = useMemo(() => transactions.filter((txn) => txn.status === 'completed'), [transactions]);

  const csv = () => {
    const header = [
      t('reports.export.col.invoice'),
      t('reports.export.col.date'),
      t('reports.export.col.customer'),
      t('reports.export.col.total'),
      t('reports.export.col.payment'),
    ];
    const lines = rows.map((txn) => [txn.invoiceNo, txn.date, txn.customerName, txn.grandTotal, txn.paymentMethod].join(','));
    download('sales-export.csv', [header.join(','), ...lines].join('\n'), 'text/csv');
    toast.success(t('reports.export.csvDownloaded'));
  };

  const json = () => {
    download('sales-export.json', JSON.stringify(rows, null, 2), 'application/json');
    toast.success(t('reports.export.jsonDownloaded'));
  };

  const pdf = () => {
    const w = window.open('', '_blank');
    if (!w) {
      toast.error(t('reports.export.popupBlocked'));
      return;
    }
    const html = `<!doctype html><html><head><title>${t('reports.export.reportTitle')}</title></head><body style="font-family:Inter,sans-serif;padding:24px">
      <h1>${t('reports.export.reportTitle')}</h1>
      <table border="1" cellspacing="0" cellpadding="6" width="100%">
        <thead><tr><th>${t('reports.export.col.invoice')}</th><th>${t('reports.export.col.date')}</th><th>${t('reports.export.col.customer')}</th><th>${t('reports.export.col.total')}</th></tr></thead>
        <tbody>
          ${rows
            .map(
              (txn) =>
                `<tr><td>${txn.invoiceNo}</td><td>${txn.date}</td><td>${txn.customerName}</td><td>${formatCurrency(txn.grandTotal)}</td></tr>`,
            )
            .join('')}
        </tbody>
      </table>
      <p>${t('reports.export.productsInCatalog', { count: products.length })}</p>
      <script>window.onload=function(){window.print();}</script>
    </body></html>`;
    w.document.write(html);
    w.document.close();
    toast.success(t('reports.export.printOpened'));
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={csv} className="px-3 py-2 rounded-xl border border-border text-sm font-semibold">
        {t('reports.export.csv')}
      </button>
      <button type="button" onClick={json} className="px-3 py-2 rounded-xl border border-border text-sm font-semibold">
        {t('reports.export.json')}
      </button>
      <button type="button" onClick={pdf} className="px-3 py-2 rounded-xl border border-border text-sm font-semibold">
        {t('reports.export.pdfPrint')}
      </button>
    </div>
  );
}
