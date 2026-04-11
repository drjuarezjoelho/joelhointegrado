/**
 * Galeria de componentes shadcn/ui — regenerada com `npx shadcn@latest add …`
 * e composição manual. Rota: /componentes
 */
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/ThemeContext";
import { Info, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ComponentsShowcase() {
  const { theme, toggleTheme } = useTheme();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [progress, setProgress] = useState(33);
  const [sliderVal, setSliderVal] = useState([50]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Galeria de componentes
              </h1>
              <p className="text-muted-foreground text-sm">
                shadcn/ui (CLI) — uso de referência para o projeto C.I.J.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
              Tema
            </Button>
          </div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Início</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Componentes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Tabs defaultValue="feedback" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="forms">Formulários</TabsTrigger>
            <TabsTrigger value="overlay">Sobreposições</TabsTrigger>
            <TabsTrigger value="data">Dados & navegação</TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Alertas e estado</CardTitle>
                <CardDescription>Alert, Badge, Progress, Skeleton</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="size-4" />
                  <AlertTitle>Informação</AlertTitle>
                  <AlertDescription>
                    Texto de apoio para alertas inline.
                  </AlertDescription>
                </Alert>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
                <div className="space-y-2 max-w-md">
                  <Progress value={progress} />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setProgress((p) => (p >= 100 ? 0 : Math.min(100, p + 10)))
                      }
                    >
                      +10%
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success("Toast de exemplo")}
                    >
                      Toast
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forms" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Controlo</CardTitle>
                <CardDescription>
                  Botões, campos, interruptores e seleção
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button size="sm">Small</Button>
                  <Button size="lg">Large</Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="email@exemplo.pt" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Notas</Label>
                    <Textarea id="area" placeholder="Texto longo…" rows={3} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox id="c1" />
                    <Label htmlFor="c1">Checkbox</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="s1" />
                    <Label htmlFor="s1">Switch</Label>
                  </div>
                </div>
                <RadioGroup defaultValue="a" className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="a" id="r1" />
                    <Label htmlFor="r1">Opção A</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="b" id="r2" />
                    <Label htmlFor="r2">Opção B</Label>
                  </div>
                </RadioGroup>
                <div className="space-y-2 max-w-xs">
                  <Label>Slider</Label>
                  <Slider
                    value={sliderVal}
                    onValueChange={setSliderVal}
                    max={100}
                    step={1}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Toggle aria-label="Toggle">B</Toggle>
                  <ToggleGroup type="single" defaultValue="left">
                    <ToggleGroupItem value="left">Esquerda</ToggleGroupItem>
                    <ToggleGroupItem value="right">Direita</ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div className="space-y-2 max-w-xs">
                  <Label>Selecionar</Label>
                  <Select defaultValue="um">
                    <SelectTrigger>
                      <SelectValue placeholder="Escolher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="um">Um</SelectItem>
                      <SelectItem value="dois">Dois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overlay" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Diálogos e menus</CardTitle>
                <CardDescription>
                  Dialog, Drawer, Sheet, Popover, Tooltip, HoverCard, Dropdown
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Título</DialogTitle>
                      <DialogDescription>
                        Conteúdo modal acessível.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>

                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline">Drawer</Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Painel</DrawerTitle>
                      <DrawerDescription>
                        Drawer (vaul) para mobile / painéis inferiores.
                      </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="outline">Fechar</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">Sheet</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Folha lateral</SheetTitle>
                      <SheetDescription>Conteúdo adicional.</SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Data</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                    />
                  </PopoverContent>
                </Popover>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Tooltip</Button>
                  </TooltipTrigger>
                  <TooltipContent>Dica contextual</TooltipContent>
                </Tooltip>

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="link">Hover card</Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <p className="text-sm">Pré-visualização ao pairar.</p>
                  </HoverCardContent>
                </HoverCard>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Menu ▾</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => toast.message("Um")}>
                      Opção 1
                    </DropdownMenuItem>
                    <DropdownMenuItem>Opção 2</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Tabelas e listas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Table>
                  <TableCaption>Legenda da tabela.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Exemplo A</TableCell>
                      <TableCell>
                        <Badge>OK</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Exemplo B</TableCell>
                      <TableCell>Pendente</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="1">
                    <AccordionTrigger>Secção 1</AccordionTrigger>
                    <AccordionContent>Conteúdo expansível.</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="2">
                    <AccordionTrigger>Secção 2</AccordionTrigger>
                    <AccordionContent>Mais conteúdo.</AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Colapsável
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="text-sm text-muted-foreground pt-2">
                    Texto mostrado quando expandido.
                  </CollapsibleContent>
                </Collapsible>

                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="" alt="" />
                    <AvatarFallback>CJ</AvatarFallback>
                  </Avatar>
                  <Separator orientation="vertical" className="h-8" />
                  <AspectRatio ratio={16 / 9} className="bg-muted w-40 rounded-md" />
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Menubar</p>
                  <Menubar>
                    <MenubarMenu>
                      <MenubarTrigger>Ficheiro</MenubarTrigger>
                      <MenubarContent>
                        <MenubarItem>Novo</MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>Sair</MenubarItem>
                      </MenubarContent>
                    </MenubarMenu>
                  </Menubar>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Paginação</p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" onClick={(e) => e.preventDefault()} />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" isActive>
                          1
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">2</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => e.preventDefault()} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Carousel</p>
                  <div className="relative px-12">
                    <Carousel className="w-full max-w-md mx-auto">
                      <CarouselContent>
                        {["Slide 1", "Slide 2", "Slide 3"].map((label, i) => (
                          <CarouselItem key={i}>
                            <Card>
                              <CardContent className="flex h-36 items-center justify-center p-6">
                                <span className="text-lg font-medium">{label}</span>
                              </CardContent>
                            </Card>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Scroll</p>
                  <ScrollArea className="h-24 w-full rounded-md border p-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <p key={i} className="text-sm">
                        Linha {i + 1} — conteúdo com scroll.
                      </p>
                    ))}
                  </ScrollArea>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Componentes gerados/atualizados com{" "}
                <code className="rounded bg-muted px-1">npx shadcn@latest add</code>.
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
