import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useCardinal } from '@/lib/cardinal-provider'
import { jaegerSearchQueryOptions, jaegerServicesQueryOptions } from '@/lib/query-options'
import { errorToast } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// custom lookback values not supported yet
const lookbackValues = [
  { title: 'Last 5 Minutes', value: '5m' },
  { title: 'Last 15 Minutes', value: '15m' },
  { title: 'Last 30 Minutes', value: '30m' },
  { title: 'Last Hour', value: '1h' },
  { title: 'Last 2 Hours', value: '2h' },
  { title: 'Last 3 Hours', value: '3h' },
  { title: 'Last 6 Hours', value: '6h' },
  { title: 'Last 12 Hours', value: '12h' },
  { title: 'Last 24 Hours', value: '24h' },
  { title: 'Last 2 Days', value: '2d' },
]

// we can afford to have a weak-ish schema and form validation since it will be validated
// again by the original jaeger ui. validation errors will be show in the iframe. this
// simplifies our code as it's already handled for us
const formSchema = z.object({
  service: z.string(),
  operation: z.string().optional(),
  tags: z.string().optional(),
  lookback: z.string(),
  maxDuration: z.string().optional(),
  minDuration: z.string().optional(),
  limit: z.coerce.number().int().gte(1).lte(1500),
})

export function JaegerSidebar() {
  const { jaegerUrl } = useCardinal()
  const { data: services } = useQuery(jaegerServicesQueryOptions({ jaegerUrl }))
  const queryClient = useQueryClient()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service: '',
      operation: '',
      tags: '',
      lookback: '1h',
      maxDuration: '',
      minDuration: '',
      limit: 20,
    },
  })
  const { toast } = useToast()

  const serviceNames = Object.keys((services as object) ?? {})
  const selectedService = form.watch('service')

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!services || !services[values.service]) {
      form.setError('service', {
        type: 'custom',
        message: 'Please select a service',
      })
      return
    }

    // set to empty string if user selected all. this will cause the `operation`
    // search param to not be included in the url
    if (values.operation === 'all') values.operation = ''

    try {
      await queryClient.fetchQuery(jaegerSearchQueryOptions({ jaegerUrl, options: values }))
    } catch (error) {
      errorToast(toast, error, 'Error searching Jaeger')
    }
  }

  return (
    <aside className="flex flex-col justify-between px-3 pt-4 pb-2 min-w-64 w-64 overflow-y-auto border-r text-sm">
      <div className="space-y-2">
        <Form {...form}>
          <form onSubmit={(e) => void form.handleSubmit(handleSubmit)(e)} className="space-y-2">
            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <Select
                    required
                    disabled={serviceNames.length === 0}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="h-8">
                        <SelectValue
                          placeholder={
                            serviceNames.length === 0 ? 'No services found' : 'Select service'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceNames.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs break-words" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="operation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operation</FormLabel>
                  <Select
                    disabled={!selectedService}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="h-8">
                        <SelectValue
                          placeholder={!selectedService ? 'No operations found' : 'All'}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem key="all" value="all">
                        All
                      </SelectItem>
                      {services &&
                        selectedService &&
                        services[selectedService] &&
                        services[selectedService].map((operation) => (
                          <SelectItem key={operation} value={operation}>
                            {operation}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs break-words" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="http.status_code=200 error=true"
                      className="h-8"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs break-words" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lookback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lookback</FormLabel>
                  <Select required defaultValue={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select lookback" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lookbackValues.map(({ title, value }) => (
                        <SelectItem key={value} value={value}>
                          {title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs break-words" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Duration</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 1.2s, ..." className="h-8" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs break-words" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Duration</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 1.2s, ..." className="h-8" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs break-words" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limit Results</FormLabel>
                  <FormControl>
                    <Input required type="number" className="h-8" min="1" max="1500" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs break-words" />
                </FormItem>
              )}
            />
            <Button disabled={!services} className="w-full h-8 gap-1">
              {form.formState.isSubmitting ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                'Find Traces'
              )}
            </Button>
          </form>
        </Form>
      </div>
      <ThemeToggle className="self-end" />
    </aside>
  )
}
