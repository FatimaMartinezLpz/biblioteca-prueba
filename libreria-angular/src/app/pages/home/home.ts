import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, Libro } from '../../services/book';

interface Categoria {
  nombre: string;
  subcategorias: string[];
  abierto: boolean;
}

interface CarruselImagen {
  url: string;
  alt: string;
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  busqueda = '';
  cantidadEnCarrito = 0;
  mostrarBolsa = false;
  carrito: (Libro & { cantidad: number })[] = [];

  // Categorías desplegables
  categoriasPrincipales: Categoria[] = [
    {
      nombre: 'Literatura',
      subcategorias: ['Novela', 'Poesía', 'Teatro', 'Ensayo'],
      abierto: false
    },
    {
      nombre: 'Ciencias',
      subcategorias: ['Matemáticas', 'Física', 'Química', 'Biología'],
      abierto: false
    },
    {
      nombre: 'Infantil',
      subcategorias: ['0-3 años', '4-6 años', '7-9 años', '10-12 años'],
      abierto: false
    },
    {
      nombre: 'Juvenil',
      subcategorias: ['Fantasía', 'Ciencia ficción', 'Romance', 'Misterio'],
      abierto: false
    }
  ];

  // Carrusel principal
  carruselImagenes: CarruselImagen[] = [
    {
      url: 'assets/img/frase1.jpg',
      alt: 'Promoción de verano',
      titulo: 'Viaja ligero, abre un libro',
      descripcion: 'Del 1 al 31 de julio encuentra nuestras promociones para este verano.'
    },
    {
      url: 'assets/img/preventa.png',
      alt: 'Novedades',
      titulo: 'Las novedades del mes',
      descripcion: 'Descubre los libros más esperados del año.'
    },
    {
      url: 'assets/img/img2.jpg',
      alt: 'Clásicos',
      titulo: 'Los clásicos nunca pasan de moda',
      descripcion: 'Ediciones especiales de tus libros favoritos.'
    }
  ];

  imagenActual = 0;
  intervaloCarrusel: any;

  // Libros destacados
  librosDestacados: Libro[] = [];
  ultimosLanzamientos: Libro[] = [];

  // Control de carruseles
  currentIndexDestacados1 = 0;
  currentIndexDestacados2 = 0;
  librosPorSlide = 4;


  // Usuario y cuenta
  usuario: { nombre: string; email: string } | null = null;
  cuentaAbierta = false;

  // Referencias a los contenedores de carrusel
  @ViewChild('destacados1', { static: false }) destacados1!: ElementRef<HTMLElement>;
  @ViewChild('destacados2', { static: false }) destacados2!: ElementRef<HTMLElement>;

  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private bookService: BookService
  ) { }

  ngOnInit(): void {
    const carritoGuardado = localStorage.getItem('carrito');
    this.carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];
    this.cantidadEnCarrito = this.carrito.reduce((total, item) => total + (item.cantidad || 1), 0);
    this.iniciarCarrusel();
    this.obtenerUsuario();
    this.cargarLibros();
  }

  cargarLibros(): void {
    this.bookService.getLibros().subscribe({
      next: libros => {
        // Duplicamos los libros para el efecto infinito
        this.librosDestacados = [...libros.slice(0, 6), ...libros.slice(0, 6)];
        this.ultimosLanzamientos = [...libros.slice(-6).reverse(), ...libros.slice(-6).reverse()];
      },
      error: err => console.error('Error cargando libros', err)
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervaloCarrusel);
  }

  // Métodos para el carrusel principal
  toggleDropdown(categoria: Categoria): void {
    categoria.abierto = !categoria.abierto;
  }

  iniciarCarrusel(): void {
    this.intervaloCarrusel = setInterval(() => {
      this.siguiente();
    }, 5000);
  }

  siguiente(): void {
    this.imagenActual = (this.imagenActual + 1) % this.carruselImagenes.length;
    this.reiniciarIntervalo();
  }

  anterior(): void {
    this.imagenActual = (this.imagenActual - 1 + this.carruselImagenes.length) % this.carruselImagenes.length;
    this.reiniciarIntervalo();
  }

  cambiarImagen(index: number): void {
    this.imagenActual = index;
    this.reiniciarIntervalo();
  }

  reiniciarIntervalo(): void {
    clearInterval(this.intervaloCarrusel);
    this.iniciarCarrusel();
  }

  // Métodos para los carruseles de libros
  // Método modificado para el carrusel infinito
  moverCarrusel(direction: string, carruselId: string): void {
    const carrusel = this[carruselId === 'destacados1' ? 'destacados1' : 'destacados2'] as ElementRef;
    const libros = carruselId === 'destacados1' ? this.librosDestacados : this.ultimosLanzamientos;
    const totalLibros = libros.length;

    // Actualizar el índice
    if (direction === 'prev') {
      this[carruselId === 'destacados1' ? 'currentIndexDestacados1' : 'currentIndexDestacados2'] =
        (this[carruselId === 'destacados1' ? 'currentIndexDestacados1' : 'currentIndexDestacados2'] - 1 + totalLibros) % totalLibros;
    } else {
      this[carruselId === 'destacados1' ? 'currentIndexDestacados1' : 'currentIndexDestacados2'] =
        (this[carruselId === 'destacados1' ? 'currentIndexDestacados1' : 'currentIndexDestacados2'] + 1) % totalLibros;
    }

    // Calcular el desplazamiento (220px por libro + 25px de gap)
    const desplazamiento = -this[carruselId === 'destacados1' ? 'currentIndexDestacados1' : 'currentIndexDestacados2'] * (220 + 25);
    carrusel.nativeElement.style.transform = `translateX(${desplazamiento}px)`;

    // Efecto infinito: si llegamos al final, hacemos un salto suave al principio
    if (this[carruselId === 'destacados1' ? 'currentIndexDestacados1' : 'currentIndexDestacados2'] >= totalLibros - this.librosPorSlide) {
      setTimeout(() => {
        this[carruselId === 'destacados1' ? 'currentIndexDestacados1' : 'currentIndexDestacados2'] = 0;
        carrusel.nativeElement.style.transition = 'none';
        carrusel.nativeElement.style.transform = `translateX(0)`;
        setTimeout(() => {
          carrusel.nativeElement.style.transition = 'transform 0.5s ease';
        }, 50);
      }, 500);
    }
  }



  // Métodos del carrito
  toggleBolsa(): void {
    this.mostrarBolsa = !this.mostrarBolsa;
  }

  agregarAlCarrito(libro: Libro): void {
    const index = this.carrito.findIndex(item => item.id === libro.id);
    if (index !== -1) {
      this.carrito[index].cantidad += 1;
    } else {
      this.carrito.push({ ...libro, cantidad: 1 });
    }
    this.actualizarCarrito();
    this.mostrarBolsa = true;
    this.mostrarNotificacion(`${libro.title} agregado al carrito`);
  }

  private mostrarNotificacion(mensaje: string): void {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-carrito';
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => {
      notificacion.classList.add('mostrar');
    }, 10);

    setTimeout(() => {
      notificacion.classList.remove('mostrar');
      setTimeout(() => {
        document.body.removeChild(notificacion);
      }, 300);
    }, 3000);
  }

  aumentarCantidad(item: any): void {
    item.cantidad += 1;
    this.actualizarCarrito();
  }

  disminuirCantidad(item: any): void {
    if (item.cantidad > 1) {
      item.cantidad -= 1;
    } else {
      this.eliminarDelCarrito(item);
    }
    this.actualizarCarrito();
  }

  eliminarDelCarrito(item: any): void {
    this.carrito = this.carrito.filter(i => i.id !== item.id);
    this.actualizarCarrito();
  }

  actualizarCarrito(): void {
    this.cantidadEnCarrito = this.carrito.reduce((t, i) => t + i.cantidad, 0);
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }

  calcularTotal(): number {
    return this.carrito.reduce((total, item) => total + (item.price * item.cantidad), 0);
  }

  procederAlPago(): void {
    if (!this.carrito.length) {
      alert('Tu bolsa está vacía');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  // Métodos de usuario
  obtenerUsuario(): void {
    const usuarioData = localStorage.getItem('usuario');
    this.usuario = usuarioData ? JSON.parse(usuarioData) : null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.cuentaAbierta = false;
      this.categoriasPrincipales.forEach(c => c.abierto = false);
    }
  }

  toggleCuenta(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.cuentaAbierta = !this.cuentaAbierta;
  }

  cerrarSesion(event: Event): void {
    event.stopPropagation();
    localStorage.removeItem('usuario');
    localStorage.removeItem('carrito');
    this.router.navigate(['/auth']);
  }

  buscarLibro(): void {
    if (this.busqueda.trim()) {
      this.router.navigate(['/busqueda'], { queryParams: { q: this.busqueda } });
    }
  }

  // Método para manejar el redimensionamiento de la ventana
  @HostListener('window:resize')
  onResize(): void {
    // Ajustar el número de libros visibles según el ancho de la pantalla
    const anchoPantalla = window.innerWidth;
    if (anchoPantalla < 768) {
      this.librosPorSlide = 1;
    } else if (anchoPantalla < 1024) {
      this.librosPorSlide = 2;
    } else {
      this.librosPorSlide = 4;
    }

    // Recalcular posiciones
    if (this.destacados1) {
      const desplazamiento1 = -this.currentIndexDestacados1 * (220 + 25);
      this.destacados1.nativeElement.style.transform = `translateX(${desplazamiento1}px)`;
    }

    if (this.destacados2) {
      const desplazamiento2 = -this.currentIndexDestacados2 * (220 + 25);
      this.destacados2.nativeElement.style.transform = `translateX(${desplazamiento2}px)`;
    }
  }
}