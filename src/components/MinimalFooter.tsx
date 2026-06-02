const MinimalFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Unbreakable Back LLC. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            407 Lincoln Road #708, Miami Beach, (FL) 33139 EEUU
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            "Espalda Indestructible" es una marca comercial de Unbreakable Back LLC
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            <a href="/politica-devoluciones" className="hover:text-primary transition-colors">
              Política de Devolución
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default MinimalFooter;
