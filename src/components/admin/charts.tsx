"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Line, LineChart, Tooltip, ResponsiveContainer } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

const videoViewsData = [
  { category: "Bastidores", views: 186, fill: "var(--color-bastidores)" },
  { category: "Entrevistas", views: 305, fill: "var(--color-entrevistas)" },
  { category: "Gols", views: 237, fill: "var(--color-gols)" },
  { category: "Histórico", views: 73, fill: "var(--color-historico)" },
  { category: "Treinos", views: 209, fill: "var(--color-treinos)" },
]

const videoViewsConfig = {
  views: {
    label: "Visualizações",
  },
  bastidores: {
    label: "Bastidores",
    color: "hsl(var(--chart-1))",
  },
  entrevistas: {
    label: "Entrevistas",
    color: "hsl(var(--chart-2))",
  },
  gols: {
    label: "Gols",
    color: "hsl(var(--chart-3))",
  },
  historico: {
    label: "Histórico",
    color: "hsl(var(--chart-4))",
  },
   treinos: {
    label: "Treinos",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function ContentViewsChart({ data }: { data: { category: string; views: number; fill: string }[] }) {
  return (
    <ChartContainer config={videoViewsConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
         <YAxis />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        <Bar dataKey="views" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

const shareDestinationsData = [
  { platform: "Facebook", shares: 540, fill: "var(--color-facebook)" },
  { platform: "Twitter/X", shares: 380, fill: "var(--color-twitter)" },
  { platform: "WhatsApp", shares: 295, fill: "var(--color-whatsapp)" },
  { platform: "LinkedIn", shares: 85, fill: "var(--color-linkedin)" },
  { platform: "Copiados", shares: 45, fill: "var(--color-copiados)" },
]

const shareDestinationsConfig = {
  shares: {
    label: "Compartilhamentos",
  },
  facebook: {
    label: "Facebook",
    color: "hsl(var(--chart-1))",
  },
  twitter: {
    label: "Twitter/X",
    color: "hsl(var(--chart-2))",
  },
  whatsapp: {
    label: "WhatsApp",
    color: "hsl(var(--chart-3))",
  },
  linkedin: {
    label: "LinkedIn",
    color: "hsl(var(--chart-4))",
  },
  copiados: {
    label: "Links Copiados",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function ShareDestinationsChart({ data }: { data: { platform: string; shares: number; fill: string }[] }) {
  return (
    <ChartContainer config={shareDestinationsConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data} layout="vertical">
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="platform"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          width={80}
          tickFormatter={(value) =>
            shareDestinationsConfig[value.toLowerCase() as keyof typeof shareDestinationsConfig]?.label
          }
        />
        <XAxis dataKey="shares" type="number" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        <Bar dataKey="shares" layout="vertical" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

const mostViewedConfig = {
  views: {
    label: "Visualizações",
  },
  noticias: {
    label: "Notícias",
    color: "hsl(var(--chart-1))",
  },
  colunas: {
    label: "Colunas",
    color: "hsl(var(--chart-2))",
  },
  videos: {
    label: "Vídeos",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function MostViewedContentChart({ data }: { data: any[] }) {
  return (
    <ChartContainer config={mostViewedConfig} className="mx-auto aspect-square max-h-[250px]">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey="views"
          nameKey="type"
          innerRadius={30}
          strokeWidth={5}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="type" />}
          className="flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  )
}

const dailyViewsConfig = {
  views: {
    label: "Acessos",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function DailyViewsChart({ data }: { data: { date: string; views: number }[] }) {
  // Format date from YYYY-MM-DD to DD/MM
  const formattedData = data.map(item => {
    const parts = item.date.split('-');
    return {
      ...item,
      formattedDate: parts.length === 3 ? `${parts[2]}/${parts[1]}` : item.date
    };
  });

  return (
    <ChartContainer config={dailyViewsConfig} className="min-h-[250px] w-full">
      <LineChart accessibilityLayer data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="formattedDate"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis 
          tickLine={false}
          axisLine={false}
          tickMargin={10}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent />}
        />
        <Line 
          type="monotone" 
          dataKey="views" 
          stroke="var(--color-views)" 
          strokeWidth={3} 
          dot={{ r: 4, fill: "var(--color-views)" }} 
          activeDot={{ r: 6 }} 
        />
      </LineChart>
    </ChartContainer>
  )
}

