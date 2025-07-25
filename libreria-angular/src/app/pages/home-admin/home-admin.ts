import { Component, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, Libro as LibroAPI } from '../../services/book';

interface LibroExtendido extends LibroAPI {
  seleccionado: boolean;
  cantidad: number;
}

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-admin.html',
  styleUrls: ['./home-admin.css']
})
export class HomeAdmin {
  librosDestacados: LibroExtendido[] = [];
  libroEnEdicion: LibroExtendido | null = null;


  nuevoLibro: LibroAPI = {
    title: '',
    author: '',
    category: '',
    description: '',
    price: 0,
    stock: 1,
    cover_url: ''
  };

  mostrarFormulario = false;

  // Usuario y cuenta
  usuario: { nombre: string; email: string } | null = null;
  cuentaAbierta = false;

  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private bookService: BookService
  ) { }

  ngOnInit(): void {
    this.obtenerUsuario();
    this.cargarLibros();
  }

  obtenerUsuario(): void {
    const usuarioData = localStorage.getItem('usuario');
    this.usuario = usuarioData ? JSON.parse(usuarioData) : null;
  }

  toggleCuenta(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.cuentaAbierta = !this.cuentaAbierta;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.cuentaAbierta = false;
    }
  }

  cerrarSesion(event: Event): void {
    event.stopPropagation();
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    this.router.navigate(['/auth']);
  }

  cargarLibros(): void {
    this.bookService.getLibros().subscribe({
      next: (libros) => {
        // Convertimos los libros en extendidos con campos adicionales
        this.librosDestacados = libros.map(l => ({
          ...l,
          seleccionado: false,
          cantidad: l.stock ?? 1
        }));
      },
      error: (err) => console.error('Error cargando libros', err)
    });
  }

  guardarCambiosLibro(): void {
    if (!this.nuevoLibro.title || !this.nuevoLibro.author || !this.nuevoLibro.category || !this.nuevoLibro.price) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (this.libroEnEdicion) {
      // Modo edición
      this.bookService.updateLibro(this.libroEnEdicion.id!, this.nuevoLibro).subscribe({
        next: (libroActualizado) => {
          const index = this.librosDestacados.findIndex(l => l.id === this.libroEnEdicion?.id);
          if (index !== -1) {
            this.librosDestacados[index] = {
              ...libroActualizado,
              seleccionado: false,
              cantidad: libroActualizado.stock ?? 1
            };
          }

          this.cancelarFormulario();
        },
        error: (err) => {
          console.error('Error al editar libro', err);
          alert('Error al editar el libro.');
        }
      });
    } else {
      // Modo agregar
      this.bookService.addLibro(this.nuevoLibro).subscribe({
        next: (libroCreado) => {
          this.librosDestacados = [
            ...this.librosDestacados,
            {
              ...libroCreado,
              seleccionado: false,
              cantidad: libroCreado.stock ?? 1
            }
          ];

          this.cancelarFormulario();
        },
        error: (err) => {
          console.error('Error al agregar libro', err);
          alert('Error al guardar el libro.');
        }
      });
    }
  }


  eliminarLibro(libro: LibroExtendido): void {
    if (!libro.id) return;
    if (!confirm(`¿Estás seguro de eliminar "${libro.title}"?`)) return;

    this.bookService.deleteLibro(libro.id).subscribe({
      next: () => {
        this.librosDestacados = this.librosDestacados.filter(l => l.id !== libro.id);
      },
      error: (err) => {
        console.error('Error al eliminar libro', err);
        alert('Error al eliminar el libro.');
      }
    });
  }

  editarLibro(libro: LibroExtendido): void {
    this.libroEnEdicion = libro;
    this.nuevoLibro = { ...libro };
    this.mostrarFormulario = true;
  }
  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.libroEnEdicion = null;
    this.nuevoLibro = {
      title: '',
      author: '',
      category: '',
      description: '',
      price: 0,
      stock: 1,
      cover_url: ''
    };
  }

}
